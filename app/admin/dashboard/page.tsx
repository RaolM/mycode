"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { toast } from "sonner"
import { Upload, Trash2, BarChart, Users, Code2, Github, PhoneIcon as WhatsApp } from "lucide-react"
import { db } from "@/lib/firebase"
import { collection, addDoc, deleteDoc, doc, onSnapshot, query, orderBy, getCountFromServer } from "firebase/firestore"
import CodeManagementTable from "@/components/CodeManagementTable"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts"

interface CodeSnippet {
  id: string
  title: string
  description: string
  language: string
  code: string
  author: string
  date: string
  pluginType?: string
  category: string
  type?: string
}

interface Stats {
  totalPosts: number
  totalScrapingPosts: number
  totalUsers: number
}

export default function AdminDashboard() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [uploading, setUploading] = useState(false)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [snippets, setSnippets] = useState<CodeSnippet[]>([])
  const [scrapingSnippets, setScrapingSnippets] = useState<CodeSnippet[]>([])
  const [stats, setStats] = useState<Stats>({ totalPosts: 0, totalScrapingPosts: 0, totalUsers: 0 })
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    code: "",
    code2: "",
    language: "JavaScript",
    category: "CASE",
    pluginType: "",
    watermark: "",
    githubLink: "",
    whatsappLink: "",
  })
  const [scrapingFormData, setScrapingFormData] = useState({
    title: "",
    description: "",
    code: "",
    code2: "",
    language: "Python",
    category: "Web Scraping",
    watermark: "",
    githubLink: "",
    whatsappLink: "",
  })
  const [scrapingUploading, setScrapingUploading] = useState(false)
  const [activeTab, setActiveTab] = useState("upload")

  useEffect(() => {
    if (!loading && !user) {
      router.push("/admin/login")
    }
  }, [user, loading, router])

  useEffect(() => {
    if (!user) return

    const fetchStats = async () => {
      const postsCount = await getCountFromServer(collection(db, "snippets"))
      const scrapingPostsCount = await getCountFromServer(collection(db, "scraping_snippets"))
      const usersCount = await getCountFromServer(collection(db, "users"))

      setStats({
        totalPosts: postsCount.data().count,
        totalScrapingPosts: scrapingPostsCount.data().count,
        totalUsers: usersCount.data().count,
      })
    }

    fetchStats()

    const q = query(collection(db, "snippets"), orderBy("date", "desc"))
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const snippetData: CodeSnippet[] = []
      querySnapshot.forEach((doc) => {
        snippetData.push({ id: doc.id, ...(doc.data() as CodeSnippet) })
      })
      setSnippets(snippetData)
    })

    const scrapingQ = query(collection(db, "scraping_snippets"), orderBy("date", "desc"))
    const scrapingUnsubscribe = onSnapshot(scrapingQ, (querySnapshot) => {
      const scrapingSnippetData: CodeSnippet[] = []
      querySnapshot.forEach((doc) => {
        scrapingSnippetData.push({ id: doc.id, ...(doc.data() as CodeSnippet), type: "scraping" })
      })
      setScrapingSnippets(scrapingSnippetData)
    })

    return () => {
      unsubscribe()
      scrapingUnsubscribe()
    }
  }, [user])

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file && file.type === "application/javascript") {
      setSelectedFile(file)
      const text = await file.text()
      setFormData((prev) => ({ ...prev, code: text }))
      toast.success("JavaScript file loaded successfully")
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setUploading(true)

    try {
      const codeData = {
        ...formData,
        author: user?.email,
        date: new Date().toISOString(),
      }

      await addDoc(collection(db, "snippets"), codeData)
      toast.success("Code snippet uploaded successfully!")
      setFormData({
        title: "",
        description: "",
        code: "",
        code2: "",
        language: "JavaScript",
        category: "CASE",
        pluginType: "",
        watermark: "",
        githubLink: "",
        whatsappLink: "",
      })
      router.push("/posts")
    } catch (error) {
      toast.error("Failed to upload code snippet")
    } finally {
      setUploading(false)
    }
  }

  const handleScrapingSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setScrapingUploading(true)

    try {
      const scrapingData = {
        ...scrapingFormData,
        author: user?.email,
        date: new Date().toISOString(),
      }

      await addDoc(collection(db, "scraping_snippets"), scrapingData)
      toast.success("Scraping snippet uploaded successfully!")
      setScrapingFormData({
        title: "",
        description: "",
        code: "",
        code2: "",
        language: "Python",
        category: "Web Scraping",
        watermark: "",
        githubLink: "",
        whatsappLink: "",
      })
      router.push("/posts")
    } catch (error) {
      toast.error("Failed to upload scraping snippet")
    } finally {
      setScrapingUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "snippets", id))
      toast.success("Code snippet deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete code snippet")
    }
  }

  const handleScrapingDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, "scraping_snippets", id))
      toast.success("Scraping snippet deleted successfully!")
    } catch (error) {
      toast.error("Failed to delete scraping snippet")
    }
  }

  const handleScrapingEdit = (snippet: CodeSnippet) => {
    setScrapingFormData({
      ...snippet,
      code2: snippet.code2 || "",
      watermark: snippet.watermark || "",
      githubLink: snippet.githubLink || "",
      whatsappLink: snippet.whatsappLink || "",
    })
    setActiveTab("scraping")
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-gray-400">Please wait while we verify your credentials.</p>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const mockChartData = [
    { name: "Mon", visitors: 400 },
    { name: "Tue", visitors: 300 },
    { name: "Wed", visitors: 500 },
    { name: "Thu", visitors: 280 },
    { name: "Fri", visitors: 390 },
    { name: "Sat", visitors: 230 },
    { name: "Sun", visitors: 360 },
  ]

  return (
    <div className="container mx-auto p-4 sm:p-6 space-y-4 sm:space-y-6">
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-xl sm:text-2xl text-white">Admin Dashboard</CardTitle>
          <CardDescription className="text-sm sm:text-base text-gray-400">
            Manage your code snippets and monitor activity
          </CardDescription>
        </CardHeader>
      </Card>

      <Tabs defaultValue="upload" className="space-y-4 sm:space-y-6">
        <TabsList className="bg-gray-800 flex flex-wrap justify-start sm:justify-center">
          <TabsTrigger value="upload" className="data-[state=active]:bg-gray-700 flex-grow sm:flex-grow-0">
            <Upload className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Upload Code</span>
          </TabsTrigger>
          <TabsTrigger value="manage" className="data-[state=active]:bg-gray-700 flex-grow sm:flex-grow-0">
            <Trash2 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Manage Code</span>
          </TabsTrigger>
          <TabsTrigger value="manage-scrape" className="data-[state=active]:bg-gray-700 flex-grow sm:flex-grow-0">
            <Code2 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Manage Scrape</span>
          </TabsTrigger>
          <TabsTrigger value="analytics" className="data-[state=active]:bg-gray-700 flex-grow sm:flex-grow-0">
            <BarChart className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Analytics</span>
          </TabsTrigger>
          <TabsTrigger value="users" className="data-[state=active]:bg-gray-700 flex-grow sm:flex-grow-0">
            <Users className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Users</span>
          </TabsTrigger>
          <TabsTrigger value="scraping" className="data-[state=active]:bg-gray-700 flex-grow sm:flex-grow-0">
            <Code2 className="w-4 h-4 mr-2" />
            <span className="hidden sm:inline">Scraping</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="upload">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-lg sm:text-xl">Upload New Code Snippet</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="Title (Required)"
                      value={formData.title}
                      onChange={(e) => setFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Textarea
                      placeholder="Description (Required)"
                      value={formData.description}
                      onChange={(e) => setFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Textarea
                      placeholder="Code (Required)"
                      value={formData.code}
                      onChange={(e) => setFormData((prev) => ({ ...prev, code: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white min-h-[200px]"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Textarea
                      placeholder="Code 2 (Optional)"
                      value={formData.code2}
                      onChange={(e) => setFormData((prev) => ({ ...prev, code2: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white min-h-[200px]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      type="file"
                      accept=".js"
                      onChange={handleFileChange}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div>
                    <Select
                      value={formData.category}
                      onValueChange={(value) =>
                        setFormData((prev) => ({
                          ...prev,
                          category: value,
                          pluginType: value === "PLUGINS" ? "ESM" : "",
                        }))
                      }
                    >
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CASE">CASE</SelectItem>
                        <SelectItem value="PLUGINS">PLUGINS</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {formData.category === "PLUGINS" && (
                    <div>
                      <Select
                        value={formData.pluginType}
                        onValueChange={(value) => setFormData((prev) => ({ ...prev, pluginType: value }))}
                      >
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Select plugin type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ESM">ESM</SelectItem>
                          <SelectItem value="CJS">CJS</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="Watermark (Optional)"
                      value={formData.watermark}
                      onChange={(e) => setFormData((prev) => ({ ...prev, watermark: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="GitHub Link (Optional)"
                      value={formData.githubLink}
                      onChange={(e) => setFormData((prev) => ({ ...prev, githubLink: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="WhatsApp Link (Optional)"
                      value={formData.whatsappLink}
                      onChange={(e) => setFormData((prev) => ({ ...prev, whatsappLink: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-purple-400 to-pink-500 flex items-center justify-center"
                  disabled={uploading}
                >
                  {uploading ? (
                    "Uploading..."
                  ) : (
                    <>
                      Upload Code Snippet
                      {formData.githubLink && <Github className="ml-2 h-4 w-4" />}
                      {formData.whatsappLink && <WhatsApp className="ml-2 h-4 w-4" />}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-lg sm:text-xl">Manage Code Snippets</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 overflow-x-auto">
              <CodeManagementTable snippets={snippets} onDelete={handleDelete} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manage-scrape">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-lg sm:text-xl">Manage Scraping Snippets</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6 overflow-x-auto">
              <CodeManagementTable
                snippets={scrapingSnippets}
                onDelete={handleScrapingDelete}
                onEdit={handleScrapingEdit}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analytics">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-lg sm:text-xl">Analytics</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <Card>
                  <CardHeader>
                    <CardTitle>Total Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.totalPosts}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Scraping Posts</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.totalScrapingPosts}</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader>
                    <CardTitle>Total Users</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-3xl font-bold">{stats.totalUsers}</p>
                  </CardContent>
                </Card>
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Visitor Statistics (Last 7 Days)</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="h-[300px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={mockChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="visitors" stroke="#8884d8" activeDot={{ r: 8 }} />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-lg sm:text-xl">User Management</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <div className="text-gray-400">User management features coming soon...</div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="scraping">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="p-4 sm:p-6">
              <CardTitle className="text-white text-lg sm:text-xl">Upload New Scraping Snippet</CardTitle>
            </CardHeader>
            <CardContent className="p-4 sm:p-6">
              <form onSubmit={handleScrapingSubmit} className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="Title (Required)"
                      value={scrapingFormData.title}
                      onChange={(e) => setScrapingFormData((prev) => ({ ...prev, title: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Textarea
                      placeholder="Description (Required)"
                      value={scrapingFormData.description}
                      onChange={(e) => setScrapingFormData((prev) => ({ ...prev, description: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white min-h-[100px]"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Textarea
                      placeholder="Code (Required)"
                      value={scrapingFormData.code}
                      onChange={(e) => setScrapingFormData((prev) => ({ ...prev, code: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white min-h-[200px]"
                      required
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Textarea
                      placeholder="Code 2 (Optional)"
                      value={scrapingFormData.code2}
                      onChange={(e) => setScrapingFormData((prev) => ({ ...prev, code2: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white min-h-[200px]"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="Watermark (Optional)"
                      value={scrapingFormData.watermark}
                      onChange={(e) => setScrapingFormData((prev) => ({ ...prev, watermark: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="GitHub Link (Optional)"
                      value={scrapingFormData.githubLink}
                      onChange={(e) => setScrapingFormData((prev) => ({ ...prev, githubLink: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <Input
                      placeholder="WhatsApp Link (Optional)"
                      value={scrapingFormData.whatsappLink}
                      onChange={(e) => setScrapingFormData((prev) => ({ ...prev, whatsappLink: e.target.value }))}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-400 flex items-center justify-center"
                  disabled={scrapingUploading}
                >
                  {scrapingUploading ? (
                    "Uploading..."
                  ) : (
                    <>
                      Upload Scraping Snippet
                      {scrapingFormData.githubLink && <Github className="ml-2 h-4 w-4" />}
                      {scrapingFormData.whatsappLink && <WhatsApp className="ml-2 h-4 w-4" />}
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

