"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { RefreshCw, Share2, Download, Facebook, Twitter, Instagram, Linkedin, LogOut, Menu, X } from "lucide-react"

// Mock news data
const mockNews = [
  {
    id: 1,
    title: "New Climate Change Initiative Launched",
    source: "Environmental News",
    date: "2025-03-05",
    url: "#",
  },
  {
    id: 2,
    title: "Global Plastic Reduction Campaign Gains Momentum",
    source: "Green Planet",
    date: "2025-03-04",
    url: "#",
  },
  {
    id: 3,
    title: "Tech Companies Join Forces for Sustainability",
    source: "Tech Today",
    date: "2025-03-03",
    url: "#",
  },
]

// Template options
const templates = [
  { id: 1, name: "Modern", color: "bg-gradient-to-r from-blue-500 to-purple-500" },
  { id: 2, name: "Minimal", color: "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900" },
  { id: 3, name: "Bold", color: "bg-gradient-to-r from-red-500 to-orange-500" },
  { id: 4, name: "Nature", color: "bg-gradient-to-r from-green-400 to-emerald-500" },
  { id: 5, name: "Ocean", color: "bg-gradient-to-r from-blue-400 to-cyan-500" },
  { id: 6, name: "Sunset", color: "bg-gradient-to-r from-pink-500 to-yellow-500" },
]

export default function Dashboard() {
  const [topic, setTopic] = useState("")
  const [generatedText, setGeneratedText] = useState("")
  const [generatedImage, setGeneratedImage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const { toast } = useToast()

  // Mock function to generate content
  const generateContent = async () => {
    if (!topic.trim()) {
      toast({
        title: "Topic required",
        description: "Please enter a topic for your awareness campaign.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      // Simulate API call to LLaMA + AutoGen
      await new Promise((resolve) => setTimeout(resolve, 2000))

      // Mock generated text
      setGeneratedText(
        `# ${topic} Awareness Campaign\n\nDid you know that ${topic} affects millions of people worldwide? It's time to take action and make a difference.\n\nJoin our campaign to raise awareness about ${topic} and help create positive change in our communities.\n\n## How You Can Help\n\n1. Share this campaign with your friends and family\n2. Donate to organizations working on ${topic}\n3. Volunteer your time to local initiatives\n\nTogether, we can make a difference!`,
      )

      // Simulate API call to Hugging Face for image generation
      await new Promise((resolve) => setTimeout(resolve, 1000))

      // Mock generated image (using placeholder)
      setGeneratedImage(`/placeholder.svg?height=400&width=600&text=${encodeURIComponent(topic)}`)

      toast({
        title: "Content generated",
        description: "Your awareness campaign has been created successfully.",
      })
    } catch (error) {
      toast({
        title: "Generation failed",
        description: "There was an error generating your content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateContent = () => {
    toast({
      title: "Regenerating content",
      description: "Creating a new version of your campaign...",
    })
    generateContent()
  }

  const shareToSocial = (platform: string) => {
    toast({
      title: `Shared to ${platform}`,
      description: "Your campaign has been shared successfully.",
    })
  }

  const downloadCampaign = () => {
    toast({
      title: "Campaign downloaded",
      description: "Your campaign assets have been downloaded.",
    })
  }

  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-40 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-16 items-center justify-between">
          <div className="flex items-center gap-2">
            <Link href="/" className="text-xl font-bold">
              AI Awareness Generator
            </Link>
          </div>
          <div className="hidden md:flex items-center gap-6">
            <nav className="flex items-center gap-6">
              <Link href="/dashboard" className="text-sm font-medium text-primary">
                Dashboard
              </Link>
              <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">
                My Campaigns
              </Link>
              <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">
                Templates
              </Link>
              <Link href="#" className="text-sm font-medium text-muted-foreground hover:text-primary">
                Settings
              </Link>
            </nav>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <Button variant="outline" size="icon">
                <LogOut className="h-4 w-4" />
                <span className="sr-only">Log out</span>
              </Button>
            </div>
          </div>
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="icon" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden border-t py-4 animate-fade-in">
            <nav className="container flex flex-col space-y-4">
              <Link href="/dashboard" className="text-sm font-medium text-primary">
                Dashboard
              </Link>
              <Link href="#" className="text-sm font-medium text-muted-foreground">
                My Campaigns
              </Link>
              <Link href="#" className="text-sm font-medium text-muted-foreground">
                Templates
              </Link>
              <Link href="#" className="text-sm font-medium text-muted-foreground">
                Settings
              </Link>
              <Button variant="outline" size="sm" className="justify-start">
                <LogOut className="h-4 w-4 mr-2" />
                Log out
              </Button>
            </nav>
          </div>
        )}
      </header>
      <main className="flex-1 container py-6">
        <div className="grid gap-6 md:grid-cols-[1fr_300px]">
          <div className="space-y-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">Create Awareness Campaign</h1>
              <p className="text-muted-foreground">
                Generate AI-powered content for your social cause or awareness campaign.
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                placeholder="Enter your campaign topic (e.g., Climate Change, Mental Health)"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="flex-1"
              />
              <Button onClick={generateContent} disabled={isGenerating}>
                {isGenerating ? "Generating..." : "Generate Campaign"}
              </Button>
            </div>

            {generatedText && (
              <Card className="animate-fade-in">
                <CardContent className="p-6">
                  <Tabs defaultValue="preview">
                    <TabsList className="mb-4">
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                      <TabsTrigger value="templates">Templates</TabsTrigger>
                    </TabsList>
                    <TabsContent value="preview" className="space-y-4">
                      <div className={`rounded-lg p-6 ${selectedTemplate.color} text-white`}>
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h2 className="text-2xl font-bold">{topic} Awareness Campaign</h2>
                            <p className="text-sm opacity-90">Join us in making a difference today</p>
                          </div>
                          {generatedImage && (
                            <img
                              src={generatedImage || "/placeholder.svg"}
                              alt={`${topic} campaign image`}
                              className="w-32 h-32 object-cover rounded-lg shadow-lg"
                            />
                          )}
                        </div>
                        <div className="prose prose-invert max-w-none">
                          <p>
                            Did you know that {topic} affects millions of people worldwide? It's time to take action and
                            make a difference.
                          </p>
                          <p>
                            Join our campaign to raise awareness about {topic} and help create positive change in our
                            communities.
                          </p>
                          <h3 className="text-xl font-semibold mt-4">How You Can Help</h3>
                          <ul>
                            <li>Share this campaign with your friends and family</li>
                            <li>Donate to organizations working on {topic}</li>
                            <li>Volunteer your time to local initiatives</li>
                          </ul>
                          <p className="font-bold">Together, we can make a difference!</p>
                        </div>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={regenerateContent} variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Regenerate
                        </Button>
                        <Button onClick={downloadCampaign} variant="outline" size="sm">
                          <Download className="h-4 w-4 mr-2" />
                          Download
                        </Button>
                        <Button onClick={() => shareToSocial("Social Media")} variant="outline" size="sm">
                          <Share2 className="h-4 w-4 mr-2" />
                          Share
                        </Button>
                        <div className="flex gap-1 ml-auto">
                          <Button
                            onClick={() => shareToSocial("Facebook")}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Facebook className="h-4 w-4 text-blue-600" />
                            <span className="sr-only">Share to Facebook</span>
                          </Button>
                          <Button
                            onClick={() => shareToSocial("Twitter")}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Twitter className="h-4 w-4 text-blue-400" />
                            <span className="sr-only">Share to Twitter</span>
                          </Button>
                          <Button
                            onClick={() => shareToSocial("Instagram")}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Instagram className="h-4 w-4 text-pink-600" />
                            <span className="sr-only">Share to Instagram</span>
                          </Button>
                          <Button
                            onClick={() => shareToSocial("LinkedIn")}
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                          >
                            <Linkedin className="h-4 w-4 text-blue-700" />
                            <span className="sr-only">Share to LinkedIn</span>
                          </Button>
                        </div>
                      </div>
                    </TabsContent>
                    <TabsContent value="edit" className="space-y-4">
                      <Textarea
                        value={generatedText}
                        onChange={(e) => setGeneratedText(e.target.value)}
                        className="min-h-[300px] font-mono text-sm"
                      />
                      <div className="flex justify-end">
                        <Button>Save Changes</Button>
                      </div>
                    </TabsContent>
                    <TabsContent value="templates" className="space-y-4">
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                        {templates.map((template) => (
                          <div
                            key={template.id}
                            className={`${template.color} rounded-lg p-4 h-24 flex items-center justify-center cursor-pointer transition-transform hover:scale-105 ${selectedTemplate.id === template.id ? "ring-2 ring-primary ring-offset-2" : ""}`}
                            onClick={() => setSelectedTemplate(template)}
                          >
                            <span className="font-medium text-white">{template.name}</span>
                          </div>
                        ))}
                      </div>
                      <div className="flex justify-end">
                        <Button
                          onClick={() =>
                            toast({
                              title: "Template applied",
                              description: `The ${selectedTemplate.name} template has been applied to your campaign.`,
                            })
                          }
                        >
                          Apply Template
                        </Button>
                      </div>
                    </TabsContent>
                  </Tabs>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="space-y-6">
            <div>
              <h2 className="text-xl font-semibold mb-4">Latest News</h2>
              <div className="space-y-4">
                {mockNews.map((item) => (
                  <Card key={item.id} className="animate-pulse-slow">
                    <CardContent className="p-4">
                      <h3 className="font-medium">{item.title}</h3>
                      <div className="flex justify-between text-sm text-muted-foreground mt-2">
                        <span>{item.source}</span>
                        <span>{new Date(item.date).toLocaleDateString()}</span>
                      </div>
                      <Button variant="link" className="p-0 h-auto mt-2">
                        Read more
                      </Button>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Campaigns</h2>
              <div className="space-y-4">
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium">Ocean Pollution Awareness</h3>
                    <p className="text-sm text-muted-foreground mt-1">Created on March 2, 2025</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="ghost" size="sm" className="h-8">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
                <Card>
                  <CardContent className="p-4">
                    <h3 className="font-medium">Mental Health Support</h3>
                    <p className="text-sm text-muted-foreground mt-1">Created on February 28, 2025</p>
                    <div className="flex gap-2 mt-2">
                      <Button variant="ghost" size="sm" className="h-8">
                        Edit
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8">
                        Share
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-center text-sm text-muted-foreground">
            © 2025 AI Awareness Generator. All rights reserved.
          </p>
          <div className="flex gap-4">
            <a href="#" className="text-sm text-muted-foreground hover:underline">
              Terms
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:underline">
              Privacy
            </a>
            <a href="#" className="text-sm text-muted-foreground hover:underline">
              Contact
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
}

