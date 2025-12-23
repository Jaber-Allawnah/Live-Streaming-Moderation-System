🚀 Real-Time Live Stream Chat Moderation System

A scalable real-time chat moderation system built using modern big data streaming technologies.
The system analyzes live chat messages, detects harmful content instantly, and provides moderators with a real-time dashboard to maintain safe online environments.

🎓 Course Project – Big Data / Streaming Systems
📅 First Semester, 2025

👥 Team

Jaber Allawnah

Ibrahim Bileh

Sami Braik

Ibrahim Herzallah

Instructor: Dr. Hamed Abdelhaq

📌 Project Motivation

Live-streaming platforms generate massive volumes of real-time user messages.
While this increases engagement, it also introduces serious challenges:

Hate speech

Harassment

Spam

Abusive or toxic language

Manual moderation alone cannot keep up with the speed and scale of live chats.

This project addresses the problem by designing and implementing a real-time streaming moderation pipeline that:

Processes messages instantly

Detects harmful content

Assists moderators with live insights

🧠 System Overview

The project was implemented in two versions, each exploring a different trade-off between detection accuracy and performance.

Core Architecture (Shared by Both Versions)
Live Chat → Kafka → Spark Structured Streaming → Detection Layer → MongoDB → React Dashboard

Key Components

Apache Kafka
High-throughput ingestion of live chat messages.

Apache Spark Structured Streaming
Real-time processing, text normalization, and moderation logic.

Detection Layer
Two alternative approaches (LSH vs Bloom Filter).

MongoDB
Persistent storage for flagged messages and moderation logs.

React Dashboard
Real-time visualization for moderators.

🧪 Implementation Details
🔹 Version 1 (V1): LSH-Based Similarity Detection

This version uses Locality Sensitive Hashing (LSH) to detect messages that are similar to known harmful content.

How it works:

Messages are cleaned and tokenized

Converted to vectors

Compared using LSH to find approximate matches

Strengths

Detects spelling variations and obfuscation

Handles intentionally modified abusive messages

Strong similarity-based moderation

Limitations

Higher computational cost

Increased latency under heavy load

Performance drops during peak traffic

🔹 Version 2 (V2): Bloom Filter–Based Exact Matching

To improve efficiency, the second version replaces similarity detection with a Bloom Filter.

How it works:

Moderators manually flag harmful messages

Flagged messages are inserted into a Bloom Filter

Incoming messages are checked in O(1) time

Observed Results

Slightly faster processing than V1

More stable and predictable runtime

Lower latency under continuous load

Limitations

Detects exact matches only

Cannot catch semantically similar or modified messages

⚠️ Performance improvement was incremental, not dramatic — the main gain was efficiency and stability, not raw speed.

📊 Dashboard Features (Planned / Template)

The moderation UI is designed to display:

Total messages count

Blocked messages count

Blocked messages percentage

Allowed vs blocked message views

Messages from the last 1 hour

Latest 5 blocked messages

Source of blocked messages

🛠 Project Management

Trello was used for task tracking and coordination

Tasks were divided across:

Backend & streaming

Detection logic

Frontend dashboard

This helped the team work in parallel and maintain clear development stages.

⚠️ Challenges Faced

Performance vs Detection Quality

LSH = better detection, higher cost

Bloom Filter = faster, less flexible

Strict Real-Time Constraints

Decisions must be made within milliseconds

User Obfuscation Techniques

Misspellings and intentional bypass attempts

Limited Backend Experience

Kafka–Spark integration was the most challenging part

Required extensive debugging and self-learning

Despite this, the team successfully delivered a fully working real-time streaming pipeline.

✅ Results & Outcomes

Successfully built a real-time moderation pipeline

Demonstrated two different detection strategies

Achieved low-latency message processing

Gave moderators direct control over blocked content

Integrated Kafka, Spark, MongoDB, and React into one system

Gained strong hands-on experience with distributed streaming systems

🔮 Future Improvements

Hybrid approach (fast Bloom Filter + similarity detection)

ML-based toxicity classification

Multilingual moderation support

Advanced dashboard analytics

Automated learning from moderator actions

📢 Why This Project Matters

This project demonstrates:

Real-world big data streaming architecture

Practical trade-offs between accuracy and performance

End-to-end system design (backend → streaming → frontend)

Strong learning outcomes in distributed systems
