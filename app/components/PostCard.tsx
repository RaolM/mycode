"use client"

import Link from "next/link"
import { Code } from "lucide-react"
import { GitHubIcon } from "@/components/icons/github-icon"
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon"

interface PostCardProps {
  id: string
  title: string
  description: string
  language: string
  category: string
  pluginType?: string
  date: string
  author: string
  watermark?: string
  githubLink?: string
  whatsappLink?: string
}

export default function PostCard({
  id,
  title,
  description,
  language,
  category,
  pluginType,
  date,
  author,
  watermark,
  githubLink,
  whatsappLink,
}: PostCardProps) {
  const censorEmail = (email: string) => {
    const [username, domain] = email.split("@")
    return `${username.slice(0, 3)}...@${domain}`
  }

  return (
    <div className="overflow-hidden rounded-lg bg-gray-900 border border-gray-800 hover:border-gray-700 transition-all hover:scale-[1.02]">
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 p-4">
        <h3 className="text-lg sm:text-xl font-semibold text-white line-clamp-2">{title}</h3>
      </div>
      <div className="p-4 space-y-4">
        <p className="text-gray-300 text-sm line-clamp-3">{description}</p>
        <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm gap-2">
          <div className="flex flex-wrap gap-2">
            <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full border border-gray-700">{language}</span>
            <span className="bg-gray-800 text-gray-300 px-2 py-1 rounded-full border border-gray-700">{category}</span>
            {pluginType && (
              <span className="bg-blue-900 text-blue-100 px-2 py-1 rounded-full border border-blue-800">
                {pluginType}
              </span>
            )}
          </div>
          <span className="text-gray-400">{new Date(date).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-wrap justify-between items-center text-xs sm:text-sm text-gray-400 gap-2">
          <span>By: {censorEmail(author)}</span>
          {watermark && <span className="text-gray-500">Watermark: {watermark}</span>}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link
            href={`/posts/${id}`}
            className="flex-1 flex items-center justify-center gap-2 bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-700 transition-colors border border-gray-700 text-sm"
          >
            <Code size={16} />
            View Code
          </Link>
          {(githubLink || whatsappLink) && (
            <div className="flex gap-2">
              {githubLink && (
                <a
                  href={githubLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
                >
                  <GitHubIcon className="w-5 h-5 text-white" />
                </a>
              )}
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center w-10 h-10 bg-gray-800 hover:bg-gray-700 rounded-lg border border-gray-700 transition-colors"
                >
                  <WhatsAppIcon className="w-5 h-5 text-white" />
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

