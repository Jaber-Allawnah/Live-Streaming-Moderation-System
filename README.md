# Real-Time Live-Stream Chat Moderation System

A real-time chat moderation pipeline that ingests live-stream messages, flags harmful content, and surfaces it to moderators through a dashboard — built to explore the trade-off between similarity-based and exact-match content detection under streaming constraints.

**Course project — Big Data / Streaming Systems, First Semester 2025**
Team: Jaber Allawnah, Ibrahim Bileh, Sami Braik, Ibrahim Herzallah · Instructor: Dr. Hamed Abdelhaq

## My Contribution

I designed and implemented the **Kafka ingestion pipeline** and **both detection engines** — the LSH-based similarity detector and the Bloom Filter-based exact matcher — including the comparative evaluation of their accuracy/latency trade-offs described below. The backend API and the React moderator dashboard were built by teammates.

## Problem

Live-streaming platforms generate high volumes of real-time chat messages, a fraction of which contain hate speech, harassment, spam, or other abusive language. Manual moderation cannot keep pace with the speed and scale of live chat, motivating an automated, low-latency detection pipeline.

## Architecture

```
Live Chat → Kafka → Spark Structured Streaming → Detection Layer → MongoDB → React Dashboard
```

- **Apache Kafka** — high-throughput ingestion of incoming chat messages
- **Spark Structured Streaming** — real-time text normalization and moderation logic
- **Detection layer** — two alternative approaches, compared below
- **MongoDB** — persistent storage for flagged messages and moderation logs
- **React dashboard** — real-time view for moderators

## Detection Approaches

Two independent detection strategies were implemented and compared, trading off detection flexibility against computational cost.

### V1 — LSH-based similarity detection

Messages are cleaned, tokenized, converted to vectors, and compared using Locality-Sensitive Hashing (LSH) to find approximate matches against known harmful content.

- **Strengths:** catches spelling variations and deliberately obfuscated abusive messages
- **Limitations:** higher computational cost; latency increases under heavy load

### V2 — Bloom Filter–based exact matching

Moderators manually flag harmful messages, which are inserted into a Bloom Filter; incoming messages are then checked for membership in O(1) time.

- **Strengths:** faster and more predictable runtime under continuous load
- **Limitations:** exact-match only — cannot catch semantically similar or reworded messages

The efficiency gain from V2 over V1 was incremental rather than dramatic: the main benefit was more stable, predictable latency, not a large raw speed-up.

## Dashboard (moderator-facing)

The React dashboard is designed to surface: total and blocked message counts, blocked-message percentage, allowed vs. blocked message views, recent activity (last hour), and the most recently blocked messages.

## Challenges

- **Detection quality vs. performance:** LSH gives better detection at higher computational cost; Bloom Filter is faster but exact-match only.
- **Real-time constraints:** moderation decisions had to be made within milliseconds of message arrival.
- **Kafka–Spark integration:** the most technically demanding part of the pipeline, requiring substantial debugging and self-directed learning.

## Results

- Built and compared two working real-time detection strategies within the same streaming pipeline
- Achieved low-latency message processing suitable for live-chat volumes
- Integrated Kafka, Spark, MongoDB, and React into a single end-to-end system

## Future Improvements

- Hybrid approach combining Bloom Filter speed with LSH-style similarity detection
- ML-based toxicity classification
- Multilingual moderation support

## Tech Stack

Apache Kafka · Apache Spark Structured Streaming · Scala · MongoDB · Node.js / Express · React
