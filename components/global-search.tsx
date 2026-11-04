"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Search, FileText, Users, Activity, Trophy, DollarSign } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"

interface SearchResult {
  title: string
  description: string
  url: string
  icon: React.ReactNode
  category: string
  // Only listed for admins; the page itself also refuses everyone else.
  adminOnly?: boolean
}

const searchablePages: SearchResult[] = [
  {
    title: "Dashboard",
    description: "View analytics and overview",
    url: "/dashboard",
    icon: <Activity className="h-4 w-4" />,
    category: "Navigation",
  },
  {
    title: "Youth Population",
    description: "General youth population data",
    url: "/youth-population",
    icon: <Users className="h-4 w-4" />,
    category: "Data",
  },
  {
    title: "Youth with Disabilities",
    description: "Data on youth with disabilities",
    url: "/youth-with-disabilities",
    icon: <Users className="h-4 w-4" />,
    category: "Data",
  },
  {
    title: "Youth without Disabilities",
    description: "Data on youth without disabilities",
    url: "/youth-without-disabilities",
    icon: <Users className="h-4 w-4" />,
    category: "Data",
  },
  {
    title: "Human Trafficking",
    description: "Human trafficking cases data",
    url: "/human-trafficking",
    icon: <FileText className="h-4 w-4" />,
    category: "Data",
  },
  {
    title: "Youth Migration",
    description: "Youth migration statistics",
    url: "/youth-migration",
    icon: <FileText className="h-4 w-4" />,
    category: "Data",
  },
  {
    title: "NYC Activities",
    description: "National Youth Council activities",
    url: "/nyc-activities",
    icon: <Activity className="h-4 w-4" />,
    category: "Programs",
  },
  {
    title: "NSC",
    description: "National Sports Council data",
    url: "/nsc",
    icon: <Trophy className="h-4 w-4" />,
    category: "Programs",
  },
  {
    title: "NYSS",
    description: "National Youth Service Scheme",
    url: "/nyss",
    icon: <Activity className="h-4 w-4" />,
    category: "Programs",
  },
  {
    title: "PIA Students",
    description: "President's International Award students",
    url: "/pia-students",
    icon: <Trophy className="h-4 w-4" />,
    category: "Programs",
  },
  {
    title: "NEDI Programs",
    description: "National Enterprise Development Initiative",
    url: "/nedi-programs",
    icon: <FileText className="h-4 w-4" />,
    category: "Programs",
  },
  {
    title: "Indicator Data",
    description: "Key performance indicators",
    url: "/indicator-data",
    icon: <FileText className="h-4 w-4" />,
    category: "Analytics",
  },
  {
    title: "Sports Financing",
    description: "Sports financing and budgets",
    url: "/sports-financing",
    icon: <DollarSign className="h-4 w-4" />,
    category: "Finance",
  },
  {
    title: "Activity Log",
    description: "System activity and audit logs",
    url: "/activity-log",
    icon: <FileText className="h-4 w-4" />,
    category: "System",
  },
  {
    title: "User Management",
    description: "Manage system users and permissions",
    url: "/user-management",
    icon: <Users className="h-4 w-4" />,
    category: "System",
    adminOnly: true,
  },
]

export function GlobalSearch({ isAdmin = false }: { isAdmin?: boolean }) {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState("")
  const router = useRouter()

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault()
        setOpen((open) => !open)
      }
    }

    document.addEventListener("keydown", down)
    return () => document.removeEventListener("keydown", down)
  }, [])

  const handleSelect = useCallback(
    (url: string) => {
      setOpen(false)
      setQuery("")
      router.push(url)
    },
    [router],
  )

  const filteredResults = searchablePages.filter(
    (page) =>
      (isAdmin || !page.adminOnly) &&
      (page.title.toLowerCase().includes(query.toLowerCase()) ||
        page.description.toLowerCase().includes(query.toLowerCase()) ||
        page.category.toLowerCase().includes(query.toLowerCase())),
  )

  const groupedResults = filteredResults.reduce(
    (acc, result) => {
      if (!acc[result.category]) {
        acc[result.category] = []
      }
      acc[result.category].push(result)
      return acc
    },
    {} as Record<string, SearchResult[]>,
  )

  return (
    <>
      <div className="relative flex-1 max-w-md">
        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Search pages... (Ctrl+K)"
          className="w-full bg-background pl-8 md:w-[300px] lg:w-[400px]"
          onClick={() => setOpen(true)}
          readOnly
        />
      </div>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder="Search for pages, data, or features..." value={query} onValueChange={setQuery} />
        <CommandList>
          <CommandEmpty>No results found.</CommandEmpty>
          {Object.entries(groupedResults).map(([category, results]) => (
            <CommandGroup key={category} heading={category}>
              {results.map((result) => (
                <CommandItem key={result.url} value={result.title} onSelect={() => handleSelect(result.url)}>
                  <div className="flex items-center gap-2">
                    {result.icon}
                    <div className="flex flex-col">
                      <span className="font-medium">{result.title}</span>
                      <span className="text-xs text-muted-foreground">{result.description}</span>
                    </div>
                  </div>
                </CommandItem>
              ))}
            </CommandGroup>
          ))}
        </CommandList>
      </CommandDialog>
    </>
  )
}
