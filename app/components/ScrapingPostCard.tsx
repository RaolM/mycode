"use client"

import Link from "next/link"
import { Code2 } from "lucide-react"
import { GitHubIcon } from "@/components/icons/github-icon"
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon"

interface ScrapingPostCardProps {
  id: string
  title: string
  description: string
  language: string
  category: string
  date: string
  author: string
  watermark?: string
  githubLink?: string
  whatsappLink?: string
}

export default function ScrapingPostCard({
  id,
  title,
  description,
  language,
  category,
  date,
  author,
  watermark,
  githubLink,
  whatsappLink,
}: ScrapingPostCardProps) {
  const censorEmail = (email: string) => {
    const [username, domain] = email.split("@")
    return `${username.slice(0, 3)}...@${domain}`
  }

  return (
    <div className="overflow-hidden rounded-lg bg-blue-900/20 border border-blue-800 hover:border-blue-700 transition-all hover:scale-[1.02]">
      <div className="bg-gradient-to-r from-blue-700 to-blue-500 p-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white line-clamp-2">{title}</h3>
      </div>
      <div className="p-4 space-y-4">
        <p className="text-blue-100 text-sm line-clamp-3">{description}</p>
        <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm gap-2">
          <div className="flex flex-wrap gap-2">
            <span className="bg-blue-800/50 text-blue-100 px-2 py-1 rounded-full border border-blue-700">
              {language}
            </span>
            <span className="bg-blue-800/50 text-blue-100 px-2 py-1 rounded-full border border-blue-700">
              {category}
            </span>
          </div>
          <span className="text-blue-300">{new Date(date).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-wrap justify-between items-center text-xs sm:text-sm text-blue-300 gap-2">
          <span>By: {censorEmail(author)}</span>
          {watermark && <span className="text-blue-400">Watermark: {watermark}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/posts/${id}?type=scraping`}
            className="flex-1 flex items-center justify-center gap-2 bg-blue-800/50 text-blue-100 py-2 rounded-lg hover:bg-blue-700/50 transition-colors border border-blue-700 text-sm"
          >
            <Code2 size={16} />
            View Scraping Code
          </Link>
          {(githubLink || whatsappLink) && (
            <div className="flex gap-2">
              {githubLink && (
                <a
                  href={githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-blue-800/50 hover:bg-blue-700/50 rounded-lg border border-blue-700 transition-colors"
                >
                  <GitHubIcon className="w-5 h-5 text-blue-100" />
                </a>
              )}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-blue-800/50 hover:bg-blue-700/50 rounded-lg border border-blue-700 transition-colors"
                >
                  <WhatsAppIcon className="w-5 h-5 text-blue-100" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

