"use client"

import { useEffect, useState } from "react"
import { useParams, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Copy, Check } from "lucide-react"
import { toast } from "sonner"
import { doc, getDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import dynamic from "next/dynamic"
import { ErrorBoundary } from "react-error-boundary"
import { GitHubIcon } from "@/components/icons/github-icon"
import { WhatsAppIcon } from "@/components/icons/whatsapp-icon"

const SyntaxHighlighter = dynamic(() => import("react-syntax-highlighter").then((mod) => mod.Prism), {
  loading: () => <div className="animate-pulse bg-gray-700 h-64 rounded-md"></div>,
  ssr: false,
})

const vscDarkPlus = dynamic(() => import("react-syntax-highlighter/dist/esm/styles/prism/vsc-dark-plus"), {
  ssr: false,
})

interface CodeSnippet {
  id: string
  title: string
  description: string
  code: string
  code2?: string
  language: string
  category: string
  author: string
  date: string
  pluginType?: string
  watermark?: string
  githubLink?: string
  whatsappLink?: string
}

function ErrorFallback({ error }: { error: Error }) {
  return (
    <div className="text-center py-10 text-red-500">
      <h2 className="text-lg font-semibold">Oops! Something went wrong.</h2>
      <p className="mt-2">{error.message}</p>
    </div>
  )
}

export default function PostDetail() {
  const params = useParams()
  const searchParams = useSearchParams()
  const [post, setPost] = useState<CodeSnippet | null>(null)
  const [copied, setCopied] = useState(false)
  const [copiedSecond, setCopiedSecond] = useState(false)

  const isScrapingPost = searchParams.get("type") === "scraping"

  useEffect(() => {
    const fetchPost = async () => {
      if (typeof params.id === "string") {
        const collectionName = isScrapingPost ? "scraping_snippets" : "snippets"
        const docRef = doc(db, collectionName, params.id)
        const docSnap = await getDoc(docRef)
        if (docSnap.exists()) {
          setPost({ id: docSnap.id, ...(docSnap.data() as CodeSnippet) })
        } else {
          console.log("No such document!")
        }
      }
    }

    fetchPost()
  }, [params.id, isScrapingPost])

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
    return <div className="text-center py-10">Loading...</div>
  }

  const bgColor = isScrapingPost ? "bg-blue-900/20" : "bg-gray-900"
  const gradientFrom = isScrapingPost ? "from-blue-700" : "from-purple-400"
  const gradientTo = isScrapingPost ? "to-blue-500" : "to-pink-500"
  const textColor = isScrapingPost ? "text-blue-100" : "text-gray-300"
  const buttonBgColor = isScrapingPost ? "bg-blue-800/50" : "bg-gray-800"
  const buttonHoverBgColor = isScrapingPost ? "hover:bg-blue-700/50" : "hover:bg-gray-700"
  const borderColor = isScrapingPost ? "border-blue-800" : "border-gray-800"

  return (
    <ErrorBoundary FallbackComponent={ErrorFallback}>
      <div className="max-w-4xl mx-auto p-4 sm:p-6">
        <div className={`space-y-6 ${bgColor} rounded-lg p-4 sm:p-6 border ${borderColor}`}>
          <div
            className={`bg-gradient-to-r ${gradientFrom} ${gradientTo} -mx-4 -mt-4 sm:-mx-6 sm:-mt-6 p-4 sm:p-6 rounded-t-lg`}
          >
            <h1 className="text-2xl sm:text-3xl font-bold text-white">{post.title}</h1>
          </div>
          <p className={`${textColor} text-sm sm:text-base`}>{post.description}</p>
          <div className="flex flex-wrap items-center justify-between text-xs sm:text-sm gap-2">
            <div className="flex flex-wrap gap-2">
              <span className={`${buttonBgColor} ${textColor} px-2 py-1 rounded-full`}>{post.language}</span>
              <span className={`${buttonBgColor} ${textColor} px-2 py-1 rounded-full`}>{post.category}</span>
              {post.pluginType && (
                <span className={`${buttonBgColor} ${textColor} px-2 py-1 rounded-full`}>{post.pluginType}</span>
              )}
            </div>
            <span className={textColor}>{new Date(post.date).toLocaleDateString()}</span>
          </div>
          <div className="flex flex-wrap justify-between items-center text-xs sm:text-sm text-gray-400 gap-2">
            <span>By: {censorEmail(post.author)}</span>
            {post.watermark && <span>Watermark: {post.watermark}</span>}
          </div>
          <div className="space-y-4">
            {post.code ? (
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
                      backgroundColor: "transparent",
                    }}
                  >
                    {post.code}
                  </SyntaxHighlighter>
                </div>
              </div>
            ) : (
              <div className="text-center py-4 bg-gray-800 rounded-lg">
                <p className="text-gray-400">No code available</p>
              </div>
            )}
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
                      backgroundColor: "transparent",
                    }}
                  >
                    {post.code2}
                  </SyntaxHighlighter>
                </div>
              </div>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Link href="/posts" className="flex-1">
              <Button variant="outline" className={`${textColor} ${buttonBgColor} ${buttonHoverBgColor} w-full`}>
                Back to Snippets
              </Button>
            </Link>
            {(post.githubLink || post.whatsappLink) && (
              <div className="flex gap-2">
                {post.githubLink && (
                  <a href={post.githubLink} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`${buttonBgColor} ${buttonHoverBgColor} ${textColor}`}
                    >
                      <GitHubIcon className="h-5 w-5" />
                    </Button>
                  </a>
                )}
                {post.whatsappLink && (
                  <a href={post.whatsappLink} target="_blank" rel="noopener noreferrer">
                    <Button
                      variant="outline"
                      size="icon"
                      className={`${buttonBgColor} ${buttonHoverBgColor} ${textColor}`}
                    >
                      <WhatsAppIcon className="h-5 w-5" />
                    </Button>
                  </a>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </ErrorBoundary>
  )
}

