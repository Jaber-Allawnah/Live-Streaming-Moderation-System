import org.apache.log4j.BasicConfigurator
import org.apache.log4j.varia.NullAppender
import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types._
import org.apache.spark.sql.streaming.Trigger

object SimilarityProcessor {

  def main(args: Array[String]): Unit = {

    val nullAppender = new NullAppender
    BasicConfigurator.configure(nullAppender)

    val spark = SparkSession.builder()
      .appName("Similarity Processing (Bloom)")
      .master("local[*]")
      .config(
        "spark.mongodb.read.connection.uri",
        "mongodb+srv://ibrahemherzallah_db_user:gCQWOB4dwN4OdwKx@cluster0.u0g2nz2.mongodb.net/?appName=Cluster0"
      )
      .config(
        "spark.mongodb.write.connection.uri",
        "mongodb+srv://ibrahemherzallah_db_user:gCQWOB4dwN4OdwKx@cluster0.u0g2nz2.mongodb.net/?appName=Cluster0"
      )
      .getOrCreate()

    val host = args(0)                 // localhost:9092
    val topicName = args(1)            // Processed-Comments-For-Bloom
    val mongoDbName = args(2)          // Live_stream_chat
    val checkpointPath = args(3)       // C:/tmp/chk/moderation
    val blockedListCollection = args(4)// Blocked_List
    val allCommentsCollection = args(5)// All_Comments

    val punctuation = """!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""

    // Kafka schema
    val schema = new StructType()
      .add("user_id", StringType, true)
      .add("username", StringType, true)
      .add("text", StringType, true)
      .add("processed_text", StringType, true)
      .add("timestamp", LongType, true)

    val kafkaDF = spark.readStream
      .format("kafka")
      .option("kafka.bootstrap.servers", host)
      .option("subscribe", topicName)
      .option("startingOffsets", "latest")
      .option("maxOffsetsPerTrigger", 30)
      .load()

    val commentsStream = kafkaDF
      .selectExpr("CAST(value AS STRING) AS json_str")
      .select(from_json(col("json_str"), schema).as("d"))
      .select("d.*")
      .filter(col("user_id").isNotNull || col("username").isNotNull || col("text").isNotNull)

    commentsStream.writeStream.foreachBatch { (batch: DataFrame, _: Long) =>
        if (!batch.isEmpty) {

          // Read Blocked_List
          val blockedRaw = spark.read
            .format("mongodb")
            .option("database", mongoDbName)
            .option("collection", blockedListCollection)
            .load()

          val blockedClean = blockedRaw
            .withColumn("processed_text", lower(coalesce(col("text"), lit(""))))
            .withColumn("processed_text", regexp_replace(col("processed_text"), "\\s+", " "))
            .withColumn("processed_text", translate(col("processed_text"), punctuation, " " * punctuation.length))
            .withColumn("processed_text", regexp_replace(col("processed_text"), "\\s+", " "))
            .withColumn("processed_text", trim(col("processed_text")))
            .filter(length(col("processed_text")) > 0)
            .select(col("processed_text"))
            .distinct()

          val expectedItems = 1000L
          val fpp = 0.01 // 1% false positives (never false negatives)

          val bloom = blockedClean.stat.bloomFilter("processed_text", expectedItems, fpp)
          val bloomBc = spark.sparkContext.broadcast(bloom)

          val mightBeBlocked = udf { s: String =>
            if (s == null) false else bloomBc.value.mightContainString(s)
          }

          val result = batch
            .withColumn(
              "status",
              when(mightBeBlocked(col("processed_text")), lit("Blocked"))
                .otherwise(lit("Allowed"))
            ).drop("processed_text")

          result.write
            .format("mongodb")
            .mode("append")
            .option("database", mongoDbName)
            .option("collection", allCommentsCollection)
            .save()
        }
      }
      .option("checkpointLocation", checkpointPath)
      .trigger(Trigger.ProcessingTime("1 seconds"))
      .start()
      .awaitTermination()
  }
}
