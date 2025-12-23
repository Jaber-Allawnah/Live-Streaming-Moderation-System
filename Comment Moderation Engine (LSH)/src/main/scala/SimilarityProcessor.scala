import org.apache.log4j.BasicConfigurator
import org.apache.log4j.varia.NullAppender
import org.apache.spark.sql.{DataFrame, SparkSession}
import org.apache.spark.sql.functions._
import org.apache.spark.sql.types._
import org.apache.spark.ml.feature.{HashingTF, MinHashLSH, StopWordsRemover}
import org.apache.spark.sql.streaming.Trigger

object SimilarityProcessor {

  def main(args: Array[String]): Unit = {

    val nullAppender = new NullAppender
    BasicConfigurator.configure(nullAppender)

    val spark = SparkSession.builder()
      .appName("Similarity Processing")
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

    val host = args(0) // localhost:9092
    val topicName = args(1)  // Processed-Comments
    val mongoDbName = args(2) // Live_stream_chat
    val checkpointPath = args(3)// C:/tmp/chk/moderation
    val blockedListCollection=args(4) //Blocked_List
    val allCommentsCollection=args(5)// All_Comments
    val punctuation = """!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""

    val schema = new StructType()
      .add("user_id", StringType, true)
      .add("username", StringType, true)
      .add("text", StringType, true)
      .add("processed_text", StringType, true)
      .add("tokens_clean", ArrayType(StringType), true)

    val kafkaDF = spark.readStream
      .format("kafka")
      .option("kafka.bootstrap.servers", host)
      .option("subscribe", topicName)
      .option("startingOffsets", "latest")
      .option("maxOffsetsPerTrigger",30)//only read 30 comments per chuck
      .load()

    val commentsStream = kafkaDF
      .selectExpr("CAST(value AS STRING) AS json_str")
      .select(from_json(col("json_str"), schema).as("d"))
      .select("d.*")
      .filter(col("user_id").isNotNull || col("username").isNotNull || col("text").isNotNull) // basic safety

    val threshold = 0.65

    commentsStream.writeStream.foreachBatch { (batch: DataFrame, _: Long) =>
        if (!batch.isEmpty) {

          val blockedRaw = spark.read
            .format("mongodb")
            .option("database", mongoDbName)
            .option("collection", blockedListCollection)
            .load()


          val blockedClean = blockedRaw
            .withColumn("processed_text", lower(coalesce(col("text"), lit(""))))
            .withColumn("processed_text", regexp_replace(col("processed_text"), "\\s+", " "))
            .withColumn("processed_text", translate(col("processed_text"), punctuation, " " * punctuation.length))
            .withColumn("tokens", split(col("processed_text"), "\\s+"))
            .withColumn("tokens", expr("filter(tokens, x -> length(trim(x)) >= 2)"))
            .filter(size(col("tokens")) > 0)

          val extraStopWords = Array("and", "or")

          val remover = new StopWordsRemover()
            .setInputCol("tokens")
            .setOutputCol("tokens_clean")
            .setStopWords(StopWordsRemover.loadDefaultStopWords("english") ++ extraStopWords)
            .setCaseSensitive(false) // default

          val blockedNoStop = remover
            .transform(blockedClean)
            .filter(size(col("tokens_clean")) > 0)

          val tf = new HashingTF()
            .setInputCol("tokens_clean")
            .setOutputCol("features")
            .setNumFeatures(1 << 18)


          val blockedFe = tf.transform(blockedNoStop)
            .select(monotonically_increasing_id().cast("string").as("blocked_id"), col("features")
            )

          val commentsWithId = batch
            .withColumn("comment_id", monotonically_increasing_id().cast("string"))
            .withColumn("tokens_clean", coalesce(col("tokens_clean"), array()))
            .filter(size(col("tokens_clean")) > 0)

          val commentsFe = tf.transform(commentsWithId)
            .select(
              col("comment_id"), col("user_id"), col("username"),
              col("text"), col("processed_text"), col("tokens_clean"),
              col("features")
            )

          //LSH Algorithm, takes vectors
          val lsh = new MinHashLSH()
            .setInputCol("features")
            .setOutputCol("hashes")
            .setNumHashTables(3)

          val model = lsh.fit(blockedFe)

          val joined = model.approxSimilarityJoin(
            model.transform(commentsFe),
            model.transform(blockedFe),
            1.0,
            "distance"//Jaccard distance=1−Jaccard similarity
          ).select(
            col("datasetA.comment_id").as("comment_id"),
            (lit(1.0) - col("distance")).as("similarity")
          )

          val maxSim = joined.groupBy("comment_id")
            .agg(max(col("similarity")).as("max_similarity"))

          val result = commentsFe.drop("features")
            .join(maxSim, Seq("comment_id"), "left")
            .withColumn("max_similarity", coalesce(col("max_similarity"), lit(0.0)))
            .withColumn(
              "status",
              when(col("max_similarity") >= threshold, "Blocked").otherwise("Allowed")
            )
            .drop("max_similarity")
            .drop("comment_id")
            .drop("processed_text")
            .drop("tokens_clean")
            .drop("features")
            .drop("hashes")
            .withColumn("createdAt", current_timestamp())
            .withColumn("updatedAt", current_timestamp())

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
