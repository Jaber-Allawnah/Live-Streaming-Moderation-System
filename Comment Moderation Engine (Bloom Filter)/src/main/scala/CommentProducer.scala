import org.apache.log4j.BasicConfigurator
import org.apache.log4j.varia.NullAppender
import org.apache.spark.sql.SparkSession
import org.apache.spark.sql.functions.{struct, to_json,col}

object CommentProducer {

  def main(args:Array[String]):Unit={
    //Configure logs
    val nullAppender=new NullAppender
    BasicConfigurator.configure(nullAppender)
    //Make a Spark Session
    val spark=SparkSession
      .builder()
      .appName("Raw Comments Producer")
      .master("local[*]")
      .getOrCreate()

    //Setup System args
    val path=args(0)// "src/main/resources/Raw_Comments.jsonl"
    val topic=args(1)// Raw-Comments
    val host=args(2)// localhost:9092

    //Read Comments and Store them in a Dataframe
    val rawComments=spark
      .read
      .json(path)

    //Kafka does not read json object, only expects key (optional) value (mandatory)->String
    val out=rawComments
      .select(
        to_json(
          struct(
            col("user_id"),
            col("username"),
            col("text"),
            col("timestamp")
          )
        ).alias("value")
      )
    //--> Outputs a single column df (value) has json object as a string

    out.write
      .format("kafka")
      .option("kafka.bootstrap.servers",host)
      .option("topic",topic)
      .save()

    spark.stop()
  }

}
