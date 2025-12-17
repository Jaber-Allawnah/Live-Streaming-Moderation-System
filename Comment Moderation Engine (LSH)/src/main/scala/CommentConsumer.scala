import org.apache.log4j.BasicConfigurator
import org.apache.log4j.varia.NullAppender
import org.apache.spark.ml.feature.StopWordsRemover
import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions.{col, concat, concat_ws, expr, from_json, lower, regexp, regexp_replace, size, split, struct, to_json, translate, trim}
import org.apache.spark.sql.streaming.Trigger
import org.apache.spark.sql.types.{LongType, StringType, StructField, StructType}

object CommentConsumer {
  def main(args:Array[String]):Unit={
    //Configure logs
    val nullAppender=new NullAppender
    BasicConfigurator.configure(nullAppender)
    //Make a Spark Session
    val spark=SparkSession
    .builder()
    .master("local[*]")
    .appName("Comment Consumer/Processor")
    .getOrCreate()

    //Setup System args
    val readTopic1=args(0)// Raw-Comments
    val writeTopic=args(1)// Processed-Comments
    val host=args(2)// "localhost:9092"
    val chk=args(3)// "C:/tmp/chk/comment-consumer-to-kafka"

    //Read Comments from Kafka Read Topic
    val kafkaComments=spark
      .readStream
      .format("kafka")
      .option("kafka.bootstrap.servers",host)
      .option("subscribe",readTopic1)
      .option("maxOffsetsPerTrigger",10)//only read 10 comments per chuck
      .load()
    //Process Data
    val values= kafkaComments.selectExpr("CAST(value AS STRING) AS value")

    //Make schema to access JSON
    val schema= StructType(Seq(
      StructField("user_id",StringType,true),
      StructField("username",StringType,true),
      StructField("text",StringType,true),
      StructField("timestamp",LongType,true)
    ))

    //Get JSON from string
    val jsonComments=values
      .select(from_json(col("value"),schema).as("parsed"))
      .filter(col("parsed").isNotNull)
      .select("parsed.*")

    //Clean Text
    val punctuation = """!"#$%&'()*+,-./:;<=>?@[\]^_`{|}~"""
    val extraStopWords = Array("and", "or")

    val cleanedV1=jsonComments
      .withColumn("processed_text",lower(col("text")))
      .withColumn("processed_text",regexp_replace(col("processed_text"),"\\s+"," "))
      .withColumn("processed_text",translate(col("processed_text"),punctuation," "* punctuation.length))
      .withColumn("tokens",split(col("processed_text"),"\\s+"))
      .withColumn("tokens",expr("filter(tokens,x->length(trim(x))>=2)"))

    val remover= new StopWordsRemover()
      .setInputCol("tokens")
      .setOutputCol("tokens_clean")
      .setStopWords(StopWordsRemover.loadDefaultStopWords("english") ++ extraStopWords)
      .setCaseSensitive(false)//default

    //noStop is a dataframe
    val noStop=remover.transform(cleanedV1)

    //final cleaning
    val cleanedV2=noStop
        .withColumn("processed_text",concat_ws(" ", col("tokens_clean")))
        .withColumn("processed_text", trim(col("processed_text")))
        .filter(size(col("tokens_clean")) > 0)
        .drop("tokens")

    val processedData=cleanedV2
      .select(
        to_json(
          struct(
          col("user_id"),
          col("username"),
          col("text"),
          col("processed_text"),
          col("tokens_clean"),
          col("timestamp")
          )
      ).alias("value"))

    //Write data to Write Topic for LSH
    processedData.writeStream
      .format("kafka")
      .option("kafka.bootstrap.servers",host)
      .option("topic",writeTopic)
      .option("checkpointLocation",chk)
      .trigger(Trigger.ProcessingTime("1 seconds"))
      .outputMode("append")
      .start()
      .awaitTermination()
  }

}
