"use client"

import { useState } from "react"
import Image from "next/image"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Github } from "lucide-react"

// Mock data for the admin's portfolio
const adminData = {
  name: "Raol Mukarrozi",
  title: "Fullstack Developer",
  bio: "Welcome to my page! I'm Raol, a Fullstack developer from Indonesia, South Kalimantan, currently living in Banjarbaru, Cempaka.",
  skills: [
    "C#",
    "JavaScript",
    "React",
    "Node.js",
    "PHP",
    "Vue.js",
    "HTML5",
    "CSS3",
    "Bootstrap",
    "MongoDB",
    "MySQL",
    "Python",
  ],
  projects: [
    {
      title: "CodeShare Platform",
      description: "A community-driven code sharing platform built with Next.js and Firebase.",
      link: "https://github.com/RaolM/mycode",
    },
  ],
  contact: {
    github: "https://github.com/RaolM",
  },
}

export default function AdminPortfolio() {
  const [activeTab, setActiveTab] = useState("about")

  return (
    <div className="container mx-auto px-4 py-8">
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader className="text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 opacity-10"></div>
          <div className="relative z-10">
            <div className="w-32 h-32 mx-auto mb-4 relative overflow-hidden rounded-full border-4 border-white/10">
              <Image
                src={adminData.avatar || "/placeholder.svg"}
                alt={adminData.name}
                layout="fill"
                objectFit="cover"
                className="rounded-full"
              />
            </div>
            <CardTitle className="text-3xl font-bold">{adminData.name}</CardTitle>
            <CardDescription className="text-xl mt-2">{adminData.title}</CardDescription>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="about">About</TabsTrigger>
              <TabsTrigger value="projects">Projects</TabsTrigger>
              <TabsTrigger value="contact">Contact</TabsTrigger>
            </TabsList>
            <TabsContent value="about" className="mt-6">
              <h3 className="text-xl font-semibold mb-2">Bio</h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">{adminData.bio}</p>
              <h3 className="text-xl font-semibold mb-2">Skills</h3>
              <div className="flex flex-wrap gap-2">
                {adminData.skills.map((skill) => (
                  <Badge
                    key={skill}
                    variant="secondary"
                    className="transition-all hover:scale-105 hover:bg-primary hover:text-primary-foreground cursor-default"
                  >
                    {skill}
                  </Badge>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="projects" className="mt-6">
              <div className="grid gap-4 md:grid-cols-2">
                {adminData.projects.map((project) => (
                  <Card key={project.title}>
                    <CardHeader>
                      <CardTitle>{project.title}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">{project.description}</p>
                      <Button asChild variant="outline" size="sm">
                        <a href={project.link} target="_blank" rel="noopener noreferrer">
                          View Project
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
            <TabsContent value="contact" className="mt-6">
              <div className="flex flex-col items-center gap-4">
                <Button asChild variant="outline" className="w-full max-w-xs">
                  <a href={adminData.contact.github} target="_blank" rel="noopener noreferrer">
                    <Github className="mr-2 h-4 w-4" /> GitHub Profile
                  </a>
                </Button>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  )
}

