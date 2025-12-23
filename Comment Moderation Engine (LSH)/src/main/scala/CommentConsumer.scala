import org.apache.log4j.BasicConfigurator
import org.apache.log4j.varia.NullAppender
import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions.{col, from_json, lower, regexp_replace, struct, to_json, translate, trim}
import org.apache.spark.sql.streaming.Trigger
import org.apache.spark.sql.types.{LongType, StringType, StructField, StructType}

object CommentConsumer {
  def main(args: Array[String]): Unit = {

    // Configure logs
    val nullAppender = new NullAppender
    BasicConfigurator.configure(nullAppender)

    // Spark
    val spark = SparkSession
      .builder()
      .master("local[*]")
      .appName("Comment Consumer / Processor - Bloom")
      .getOrCreate()

    // Args
    val readTopic1 = args(0) // Raw-Comments
    val writeTopic = args(1) // Processed-Comments
    val host = args(2)       // localhost:9092
    val chk = args(3)        // C:/tmp/chk/comment-consumer-to-kafka

    // Read from Kafka
    val kafkaComments = spark
      .readStream
      .format("kafka")
      .option("kafka.bootstrap.servers", host)
      .option("subscribe", readTopic1)
      .option("maxOffsetsPerTrigger", 10)
      .load()

    val values = kafkaComments.selectExpr("CAST(value AS STRING) AS value")

    // JSON schema
    val schema = StructType(Seq(
      StructField("user_id", StringType, true),
      StructField("username", StringType, true),
      StructField("text", StringType, true)
    ))

    // Parse JSON
    val jsonComments = values
      .select(from_json(col("value"), schema).as("parsed"))
      .filter(col("parsed").isNotNull)
      .select("parsed.*")

    // Normalize text for Bloom filter
    val punctuation = """!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""

    val cleaned = jsonComments
      .withColumn("processed_text", lower(col("text")))
      .withColumn("processed_text", regexp_replace(col("processed_text"), "\\s+", " "))
      .withColumn(
        "processed_text",
        translate(col("processed_text"), punctuation, " " * punctuation.length)
      )
      .withColumn("processed_text", regexp_replace(col("processed_text"), "\\s+", " "))
      .withColumn("processed_text", trim(col("processed_text")))

    // Final output (processed_text is the Bloom key)
    val processedData = cleaned
      .select(
        to_json(
          struct(
            col("user_id"),
            col("username"),
            col("text"),
            col("processed_text")
          )
        ).alias("value")
      )

    // Write to Kafka
    processedData.writeStream
      .format("kafka")
      .option("kafka.bootstrap.servers", host)
      .option("topic", writeTopic)
      .option("checkpointLocation", chk)
      .trigger(Trigger.ProcessingTime("1 seconds"))
      .outputMode("append")
      .start()
      .awaitTermination()
  }
}
