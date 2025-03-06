"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/components/ui/use-toast"
import Link from "next/link"
import { RefreshCw, Share2, Download, Facebook, Twitter, Instagram, Linkedin, LogOut, Menu, X } from "lucide-react"
import { campaignsAPI, newsAPI } from "@/lib/api"
import { useRouter } from "next/navigation"
import { getAuth, signOut } from "firebase/auth"

// Template options
const templates = [
  { id: 1, name: "Modern", color: "bg-gradient-to-r from-blue-500 to-purple-500" },
  { id: 2, name: "Minimal", color: "bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-800 dark:to-gray-900" },
  { id: 3, name: "Bold", color: "bg-gradient-to-r from-red-500 to-orange-500" },
  { id: 4, name: "Nature", color: "bg-gradient-to-r from-green-400 to-emerald-500" },
  { id: 5, name: "Ocean", color: "bg-gradient-to-r from-blue-400 to-cyan-500" },
  { id: 6, name: "Sunset", color: "bg-gradient-to-r from-pink-500 to-yellow-500" },
]

interface Campaign {
  id: string
  topic: string
  text: string
  imageUrl: string
  createdAt: string
}

interface NewsItem {
  title: string
  source: {
    name: string
  }
  publishedAt: string
  url: string
}

export default function Dashboard() {
  const [topic, setTopic] = useState("")
  const [generatedText, setGeneratedText] = useState("")
  const [generatedImage, setGeneratedImage] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTemplate, setSelectedTemplate] = useState(templates[0])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [news, setNews] = useState<NewsItem[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [currentCampaign, setCurrentCampaign] = useState<Campaign | null>(null)
  const { toast } = useToast()
  const router = useRouter()
  const auth = getAuth()

  useEffect(() => {
    // Fetch news
    const fetchNews = async () => {
      try {
        const response = await newsAPI.getTrending()
        if (response.success) {
          setNews(response.news)
        }
      } catch (error) {
        console.error("Error fetching news:", error)
      }
    }

    // Fetch user's campaigns
    const fetchCampaigns = async () => {
      try {
        const response = await campaignsAPI.list()
        if (response.success) {
          setCampaigns(response.campaigns)
        }
      } catch (error) {
        console.error("Error fetching campaigns:", error)
      }
    }

    fetchNews()
    fetchCampaigns()
  }, [])

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
      const response = await campaignsAPI.generate(topic)

      if (response.success) {
        const campaign = response.campaign
        setCurrentCampaign(campaign)
        setGeneratedText(campaign.text)
        setGeneratedImage(campaign.imageUrl)

        // Add the new campaign to the list
        setCampaigns([campaign, ...campaigns])

        toast({
          title: "Content generated",
          description: "Your awareness campaign has been created successfully.",
        })
      } else {
        throw new Error(response.message || "Failed to generate campaign")
      }
    } catch (error) {
      console.error("Error generating campaign:", error)
      toast({
        title: "Generation failed",
        description: "There was an error generating your content. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const regenerateContent = async () => {
    if (!currentCampaign) {
      toast({
        title: "No campaign selected",
        description: "Please generate a campaign first.",
        variant: "destructive",
      })
      return
    }

    toast({
      title: "Regenerating content",
      description: "Creating a new version of your campaign...",
    })

    try {
      const response = await campaignsAPI.regenerate(currentCampaign.id)

      if (response.success) {
        const campaign = response.campaign
        setCurrentCampaign(campaign)
        setGeneratedText(campaign.text)

        // Update the campaign in the list
        const updatedCampaigns = campaigns.map((c) => (c.id === campaign.id ? campaign : c))
        setCampaigns(updatedCampaigns)

        toast({
          title: "Content regenerated",
          description: "Your campaign has been updated with new content.",
        })
      } else {
        throw new Error(response.message || "Failed to regenerate campaign")
      }
    } catch (error) {
      console.error("Error regenerating campaign:", error)
      toast({
        title: "Regeneration failed",
        description: "There was an error regenerating your content. Please try again.",
        variant: "destructive",
      })
    }
  }

  const shareToSocial = (platform: string) => {
    // In a real implementation, this would use the Web Share API or platform-specific SDKs
    toast({
      title: `Shared to ${platform}`,
      description: "Your campaign has been shared successfully.",
    })
  }

  const downloadCampaign = () => {
    if (!currentCampaign) {
      toast({
        title: "No campaign selected",
        description: "Please generate a campaign first.",
        variant: "destructive",
      })
      return
    }

    // In a real implementation, this would create a PDF or image file
    const element = document.createElement("a")
    const file = new Blob([currentCampaign.text], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `${currentCampaign.topic.replace(/\s+/g, "-").toLowerCase()}-campaign.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)

    toast({
      title: "Campaign downloaded",
      description: "Your campaign has been downloaded as a text file.",
    })
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)
      localStorage.removeItem("token")
      router.push("/login")
    } catch (error) {
      console.error("Error logging out:", error)
      toast({
        title: "Logout failed",
        description: "There was an error logging out. Please try again.",
        variant: "destructive",
      })
    }
  }

  const updateCampaignText = async () => {
    if (!currentCampaign) {
      return
    }

    try {
      const response = await campaignsAPI.update(currentCampaign.id, generatedText)

      if (response.success) {
        const campaign = response.campaign

        // Update the campaign in the list
        const updatedCampaigns = campaigns.map((c) => (c.id === campaign.id ? campaign : c))
        setCampaigns(updatedCampaigns)

        toast({
          title: "Campaign updated",
          description: "Your changes have been saved successfully.",
        })
      } else {
        throw new Error(response.message || "Failed to update campaign")
      }
    } catch (error) {
      console.error("Error updating campaign:", error)
      toast({
        title: "Update failed",
        description: "There was an error saving your changes. Please try again.",
        variant: "destructive",
      })
    }
  }

  const loadCampaign = async (campaignId: string) => {
    try {
      const response = await campaignsAPI.get(campaignId)

      if (response.success) {
        const campaign = response.campaign
        setCurrentCampaign(campaign)
        setTopic(campaign.topic)
        setGeneratedText(campaign.text)
        setGeneratedImage(campaign.imageUrl)
      } else {
        throw new Error(response.message || "Failed to load campaign")
      }
    } catch (error) {
      console.error("Error loading campaign:", error)
      toast({
        title: "Loading failed",
        description: "There was an error loading the campaign. Please try again.",
        variant: "destructive",
      })
    }
  }

  const deleteCampaign = async (campaignId: string) => {
    try {
      const response = await campaignsAPI.delete(campaignId)

      if (response.success) {
        // Remove the campaign from the list
        const updatedCampaigns = campaigns.filter((c) => c.id !== campaignId)
        setCampaigns(updatedCampaigns)

        // Clear current campaign if it was deleted
        if (currentCampaign && currentCampaign.id === campaignId) {
          setCurrentCampaign(null)
          setGeneratedText("")
          setGeneratedImage("")
        }

        toast({
          title: "Campaign deleted",
          description: "Your campaign has been deleted successfully.",
        })
      } else {
        throw new Error(response.message || "Failed to delete campaign")
      }
    } catch (error) {
      console.error("Error deleting campaign:", error)
      toast({
        title: "Deletion failed",
        description: "There was an error deleting the campaign. Please try again.",
        variant: "destructive",
      })
    }
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
              <Button variant="outline" size="icon" onClick={handleLogout}>
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
              <Button variant="outline" size="sm" className="justify-start" onClick={handleLogout}>
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

            {(generatedText || currentCampaign) && (
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
                          {generatedText.split("\n").map((line, index) => (
                            <p key={index}>{line}</p>
                          ))}
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
                        <Button onClick={updateCampaignText}>Save Changes</Button>
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
                {news.length > 0 ? (
                  news.map((item, index) => (
                    <Card key={index} className="animate-pulse-slow">
                      <CardContent className="p-4">
                        <h3 className="font-medium">{item.title}</h3>
                        <div className="flex justify-between text-sm text-muted-foreground mt-2">
                          <span>{item.source.name}</span>
                          <span>{new Date(item.publishedAt).toLocaleDateString()}</span>
                        </div>
                        <a href={item.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="link" className="p-0 h-auto mt-2">
                            Read more
                          </Button>
                        </a>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-4 text-center text-muted-foreground">
                      No news available at the moment.
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>

            <div>
              <h2 className="text-xl font-semibold mb-4">Recent Campaigns</h2>
              <div className="space-y-4">
                {campaigns.length > 0 ? (
                  campaigns.map((campaign) => (
                    <Card key={campaign.id}>
                      <CardContent className="p-4">
                        <h3 className="font-medium">{campaign.topic}</h3>
                        <p className="text-sm text-muted-foreground mt-1">
                          Created on {new Date(campaign.createdAt).toLocaleDateString()}
                        </p>
                        <div className="flex gap-2 mt-2">
                          <Button variant="ghost" size="sm" className="h-8" onClick={() => loadCampaign(campaign.id)}>
                            Edit
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8"
                            onClick={() => shareToSocial("Social Media")}
                          >
                            Share
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 text-destructive hover:text-destructive"
                            onClick={() => deleteCampaign(campaign.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                ) : (
                  <Card>
                    <CardContent className="p-4 text-center text-muted-foreground">
                      No campaigns yet. Create your first campaign!
                    </CardContent>
                  </Card>
                )}
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

