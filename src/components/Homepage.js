"use client"
import React from "react"

function Homepage() {
  return (
      <section className="flex justify-center items-center my-12 md:my-16 text-center">
        <div>
          <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold text-blue-900 leading-tight">
            <span className="block">
              Organize <span className="text-blue-600">smarter</span>.
            </span>
            <span className="block">
              Plan <span className="text-blue-600">better</span>.
            </span>
            <span className="block">
              Summarize <span className="text-blue-600">instantly</span>.
            </span>
          </h1>
          <p className="my-6 md:my-8 text-lg md:text-2xl font-semibold">
            Your all-in-one <span className="text-blue-600">AI workspace</span> for summaries, task management, and planning.
          </p>
          <div className="mt-12 flex justify-center gap-8 flex-wrap">
            {[
              { text: "AI-Powered Summarization", icon: "⚡" },
              { text: "Smart Task Management", icon: "✅" },
              { text: "Intelligent Planning Agent", icon: "🤖" },
              { text: "Cloud Ready", icon: "☁️" },
            ].map((item, i) => (
              <div
                key={i}
                className="flex items-center gap-2 text-gray-600 font-medium"
              >
                <span className="text-xl">{item.icon}</span>
                {item.text}
              </div>
            ))}
          </div>
        </div>
    </section>
  )
}

export default Homepage
