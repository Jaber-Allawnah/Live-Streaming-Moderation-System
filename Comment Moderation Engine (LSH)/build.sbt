ThisBuild / version := "0.1.0-SNAPSHOT"
ThisBuild / scalaVersion := "2.12.18"

lazy val root = (project in file("."))
  .settings(
    name := "Scala with Spark",
    libraryDependencies ++= Seq(
      "org.apache.spark" %% "spark-core"  % "3.5.1",
      "org.apache.spark" %% "spark-sql"   % "3.5.1",
      "org.apache.spark" %% "spark-sql-kafka-0-10" % "3.5.0",
      "org.apache.spark" %% "spark-mllib" % "3.5.1",
      "org.mongodb.spark" %% "mongo-spark-connector" % "10.5.0"

)
  )
