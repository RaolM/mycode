"use client"

import { useEffect, useState } from "react"
import { useParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import dynamic from "next/dynamic"
import { Skeleton } from "@/components/ui/skeleton"
import { GitHubIcon } from "@/components/icons/github-icon"
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon"

const SyntaxHighlighter = dynamic(() => import("react-syntax-highlighter").then((mod) => mod.Prism), {
  loading: () => <Skeleton className="h-64 w-full" />,
  ssr: false,
})

const vscDarkPlus = dynamic(() => import("react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus"), {
  ssr: false,
})

interface ScrapingSnippet {
  id: string
  title: string
  description: string
  code: string
  code2?: string
  language: string
  category: string
  author: string
  date: string
  watermark?: string
  githubLink?: string
  whatsappLink?: string
}

export default function ScrapingPostDetail() {
  const params = useParams()
  const [post, setPost] = useState<ScrapingSnippet | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedSecond, setCopiedSecond] = useState(false)

  useEffect(() => {
    const fetchPost = async () => {
      if (typeof params.id === "string") {
        const docRef = doc(db, "scraping_snippets", params.id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...(docSnap.data() as ScrapingSnippet) })
        } else {
          console.log("No such document!")
        }
      }
    }

    fetchPost()
  }, [params.id])

  const copyCode = async (code: string, isSecond = false) => {
    if (code) {
      try {
        await navigator.clipboard.writeText(code)
        if (isSecond) {
          setCopiedSecond(true)
          setTimeout(() => setCopiedSecond(false), 2000)
        } else {
          setCopied(true)
          setTimeout(() => setCopied(false), 2000)
        }
        toast.success("Code copied to clipboard!")
      } catch (err) {
        toast.error("Failed to copy code")
      }
    }
  }

  const censorEmail = (email: string) => {
    if (!email) return ""
    const [username, domain] = email.split("@")
    return `${username.slice(0, 3)}...@${domain}`
  }

  if (!post) {
    return <div className="text-center py-10 text-blue-100">Loading...</div>
  }

  return (
    <div className="max-w-4xl mx-auto p-4 sm:p-6">
      <div className="space-y-6 bg-blue-900/20 rounded-lg p-4 sm:p-6 border border-blue-800">
        <div className="bg-gradient-to-r from-blue-700 to-blue-500 -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 p-4 sm:p-6 rounded-t-lg">
          <h1 className="text-2xl sm:text-3xl font-bold text-white">{post.title}</h1>
        </div>
        <p className="text-blue-100 text-sm sm:text-base">{post.description}</p>
        <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm gap-2">
          <div className="flex flex-wrap gap-2">
            <span className="bg-blue-800/50 text-blue-100 px-2 py-1 rounded-full">{post.language}</span>
            <span className="bg-blue-800/50 text-blue-100 px-2 py-1 rounded-full">{post.category}</span>
          </div>
          <span className="text-blue-300">{new Date(post.date).toLocaleDateString()}</span>
        </div>
        <div className="flex flex-wrap justify-between items-center text-xs sm:text-sm text-blue-300 gap-2">
          <span>By: {censorEmail(post.author)}</span>
          {post.watermark && <span>Watermark: {post.watermark}</span>}
        </div>
        <div className="space-y-4">
          <div className="relative">
            <Button
              variant="outline"
              size="icon"
              className="absolute right-2 top-2 z-10"
              onClick={() => copyCode(post.code)}
            >
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
            <div className="rounded-lg overflow-hidden">
              <SyntaxHighlighter
                language={post.language.toLowerCase()}
                style={vscDarkPlus}
                showLineNumbers
                customStyle={{
                  margin: 0,
                  padding: "1.5rem",
                  fontSize: "0.9rem",
                }}
              >
                {post.code || ""}
              </SyntaxHighlighter>
            </div>
          </div>
          {post.code2 && (
            <div className="relative">
              <Button
                variant="outline"
                size="icon"
                className="absolute right-2 top-2 z-10"
                onClick={() => copyCode(post.code2 || "", true)}
              >
                {copiedSecond ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
              </Button>
              <div className="rounded-lg overflow-hidden">
                <SyntaxHighlighter
                  language={post.language.toLowerCase()}
                  style={vscDarkPlus}
                  showLineNumbers
                  customStyle={{
                    margin: 0,
                    padding: "1.5rem",
                    fontSize: "0.9rem",
                  }}
                >
                  {post.code2}
                </SyntaxHighlighter>
              </div>
            </div>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/scraping" className="flex-1">
            <Button
              variant="outline"
              className="w-full text-blue-100 bg-blue-800/50 hover:bg-blue-700/50 border-blue-700"
            >
              Back to Scraping Snippets
            </Button>
          </Link>
          {(post.githubLink || post.whatsappLink) && (
            <div className="flex gap-2">
              {post.githubLink && (
                <a href={post.githubLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="bg-blue-800/50 hover:bg-blue-700/50 text-blue-100">
                    <GitHubIcon className="h-5 w-5" />
                  </Button>
                </a>
              )}
              {post.whatsappLink && (
                <a href={post.whatsappLink} target="_blank" rel="noopener noreferrer">
                  <Button variant="outline" size="icon" className="bg-blue-800/50 hover:bg-blue-700/50 text-blue-100">
                    <WhatsAppIcon className="h-5 w-5" />
                  </Button>
                </a>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

