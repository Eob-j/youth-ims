// "use client"

// import type React from "react"
// import { useState, useEffect } from "react"
// import { allGNYCActivities, youthOrganizations, type GNYCActivity } from "@/lib/gnyc-data"
// import { DataTable } from "@/components/data-table"
// import { Button } from "@/components/ui/button"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
// import { Badge } from "@/components/ui/badge"
// import {
//   PlusCircle,
//   Users,
//   Target,
//   Calendar,
//   MapPin,
//   TrendingUp,
//   Award,
//   Lightbulb,
//   Leaf,
//   Heart,
//   Palette,
//   Trophy,
//   Building2,
//   Edit,
//   Trash2,
// } from "lucide-react"
// import {
//   Dialog,
//   DialogContent,
//   DialogDescription,
//   DialogFooter,
//   DialogHeader,
//   DialogTitle,
//   DialogTrigger,
// } from "@/components/ui/dialog"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { Textarea } from "@/components/ui/textarea"
// import type { ColumnDef } from "@tanstack/react-table"
// import { saveToLocalStorage, loadFromLocalStorage } from "@/lib/local-storage"
// import { useActivity } from "@/contexts/activity-context"
// import { DataImportDialog } from "@/components/data-import-dialog"
// import { CanEditWrapper } from "@/components/can-edit-wrapper"
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   Legend,
//   ResponsiveContainer,
//   PieChart,
//   Pie,
//   Cell,
// } from "recharts"

// const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6", "#06B6D4", "#84CC16"]

// const getCategoryIcon = (category: string) => {
//   switch (category) {
//     case "Leadership Development":
//       return Award
//     case "Skills Development":
//       return Lightbulb
//     case "Entrepreneurship":
//       return TrendingUp
//     case "Environmental":
//       return Leaf
//     case "Health & Wellness":
//       return Heart
//     case "Arts & Culture":
//       return Palette
//     case "Sports & Recreation":
//       return Trophy
//     default:
//       return Target
//   }
// }

// const getCategoryColor = (category: string) => {
//   switch (category) {
//     case "Leadership Development":
//       return "bg-blue-100 text-blue-800 border-blue-200"
//     case "Skills Development":
//       return "bg-yellow-100 text-yellow-800 border-yellow-200"
//     case "Entrepreneurship":
//       return "bg-green-100 text-green-800 border-green-200"
//     case "Environmental":
//       return "bg-emerald-100 text-emerald-800 border-emerald-200"
//     case "Health & Wellness":
//       return "bg-red-100 text-red-800 border-red-200"
//     case "Arts & Culture":
//       return "bg-purple-100 text-purple-800 border-purple-200"
//     case "Sports & Recreation":
//       return "bg-orange-100 text-orange-800 border-orange-200"
//     default:
//       return "bg-gray-100 text-gray-800 border-gray-200"
//   }
// }

// const getFunderColor = (funder: string) => {
//   switch (funder) {
//     case "UNDP":
//       return "bg-blue-100 text-blue-800 border-blue-200"
//     case "EU":
//       return "bg-indigo-100 text-indigo-800 border-indigo-200"
//     case "World Bank":
//       return "bg-green-100 text-green-800 border-green-200"
//     case "GEF":
//       return "bg-emerald-100 text-emerald-800 border-emerald-200"
//     case "WHO":
//       return "bg-red-100 text-red-800 border-red-200"
//     case "UNESCO":
//       return "bg-purple-100 text-purple-800 border-purple-200"
//     case "FIFA Foundation":
//       return "bg-orange-100 text-orange-800 border-orange-200"
//     default:
//       return "bg-gray-100 text-gray-800 border-gray-200"
//   }
// }

// const getStatusColor = (status: string) => {
//   switch (status) {
//     case "Completed":
//       return "bg-green-100 text-green-800 border-green-200"
//     case "Ongoing":
//       return "bg-blue-100 text-blue-800 border-blue-200"
//     case "Planned":
//       return "bg-yellow-100 text-yellow-800 border-yellow-200"
//     default:
//       return "bg-gray-100 text-gray-800 border-gray-200"
//   }
// }

// export default function GNYCActivitiesPage() {
//   // Initialize with default data first
//   const [data, setData] = useState<GNYCActivity[]>(allGNYCActivities)
//   const [isLoaded, setIsLoaded] = useState(false)
//   const [open, setOpen] = useState(false)
//   const [editingId, setEditingId] = useState<string | null>(null)
//   const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
//   const [activityToDelete, setActivityToDelete] = useState<GNYCActivity | null>(null)
//   const [selectedCategory, setSelectedCategory] = useState<string>("all")
//   const [selectedRegion, setSelectedRegion] = useState<string>("all")
//   const [selectedYear, setSelectedYear] = useState<string>("all")
//   const [formData, setFormData] = useState({
//     activityName: "",
//     category: "",
//     region: "",
//     year: "",
//     beneficiaries: "",
//     male: "",
//     female: "",
//     fundingPartner: "",
//     description: "",
//     status: "",
//   })
//   const { trackActivity } = useActivity()

//   // Load data from localStorage on mount
//   useEffect(() => {
//     const storedData = loadFromLocalStorage("gnycActivitiesData", allGNYCActivities)
//     // Only use stored data if it's not empty and is an array
//     if (storedData && Array.isArray(storedData) && storedData.length > 0) {
//       setData(storedData)
//     } else {
//       // If no valid stored data, use default and save it
//       setData(allGNYCActivities)
//       saveToLocalStorage("gnycActivitiesData", allGNYCActivities)
//     }
//     setIsLoaded(true)
//   }, [])

//   // Save data to localStorage whenever it changes (but only after initial load)
//   useEffect(() => {
//     if (isLoaded) {
//       saveToLocalStorage("gnycActivitiesData", data)
//     }
//   }, [data, isLoaded])

//   const filteredData = data.filter((item) => {
//     return (
//       (selectedCategory === "all" || item.category === selectedCategory) &&
//       (selectedRegion === "all" || item.region === selectedRegion) &&
//       (selectedYear === "all" || item.year.toString() === selectedYear)
//     )
//   })

//   // Safe number conversion with fallback to 0
//   const safeNumber = (value: any): number => {
//     if (value === null || value === undefined || value === "") return 0
//     const num = Number(value)
//     return isNaN(num) ? 0 : num
//   }

//   // Calculate summary statistics with safe number handling
//   const totalBeneficiaries = filteredData.reduce((sum, item) => sum + safeNumber(item.beneficiaries), 0)
//   const totalMale = filteredData.reduce((sum, item) => sum + safeNumber(item.male), 0)
//   const totalFemale = filteredData.reduce((sum, item) => sum + safeNumber(item.female), 0)

//   // Prepare chart data with safe number handling
//   const categoryData = [
//     "Leadership Development",
//     "Skills Development",
//     "Entrepreneurship",
//     "Environmental",
//     "Health & Wellness",
//     "Arts & Culture",
//     "Sports & Recreation",
//   ].map((category) => ({
//     name: category,
//     value: data
//       .filter((item) => item.category === category)
//       .reduce((sum, item) => sum + safeNumber(item.beneficiaries), 0),
//     color:
//       COLORS[
//         [
//           "Leadership Development",
//           "Skills Development",
//           "Entrepreneurship",
//           "Environmental",
//           "Health & Wellness",
//           "Arts & Culture",
//           "Sports & Recreation",
//         ].indexOf(category)
//       ],
//   }))

//   const yearlyData = [2022, 2023, 2024].map((year) => ({
//     year: year.toString(),
//     activities: data.filter((item) => item.year === year).length,
//     beneficiaries: data
//       .filter((item) => item.year === year)
//       .reduce((sum, item) => sum + safeNumber(item.beneficiaries), 0),
//   }))

//   const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
//     const { name, value } = e.target
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const handleSelectChange = (name: string, value: string) => {
//     setFormData((prev) => ({ ...prev, [name]: value }))
//   }

//   const resetForm = () => {
//     setFormData({
//       activityName: "",
//       category: "",
//       region: "",
//       year: "",
//       beneficiaries: "",
//       male: "",
//       female: "",
//       fundingPartner: "",
//       description: "",
//       status: "",
//     })
//   }

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault()

//     if (editingId) {
//       // Update existing activity
//       const updatedData = data.map((activity) =>
//         activity.id === editingId
//           ? {
//               ...activity,
//               activityName: formData.activityName,
//               category: formData.category,
//               region: formData.region,
//               year: Number.parseInt(formData.year) || 0,
//               beneficiaries: Number.parseInt(formData.beneficiaries) || 0,
//               male: Number.parseInt(formData.male) || 0,
//               female: Number.parseInt(formData.female) || 0,
//               fundingPartner: formData.fundingPartner,
//               description: formData.description,
//               status: formData.status as "Completed" | "Ongoing" | "Planned",
//             }
//           : activity,
//       )
//       setData(updatedData)
//       trackActivity("Edit", "GNYC Activity", `Updated activity: ${formData.activityName}`)
//     } else {
//       // Add new activity
//       const newActivity: GNYCActivity = {
//         id: `gnyc_${Date.now()}`,
//         activityName: formData.activityName,
//         category: formData.category,
//         region: formData.region,
//         year: Number.parseInt(formData.year) || 0,
//         beneficiaries: Number.parseInt(formData.beneficiaries) || 0,
//         male: Number.parseInt(formData.male) || 0,
//         female: Number.parseInt(formData.female) || 0,
//         fundingPartner: formData.fundingPartner,
//         description: formData.description,
//         status: formData.status as "Completed" | "Ongoing" | "Planned",
//       }

//       const updatedData = [...data, newActivity]
//       setData(updatedData)
//       trackActivity("Add", "GNYC Activity", `Added new activity: ${formData.activityName}`)
//     }

//     setOpen(false)
//     setEditingId(null)
//     resetForm()
//   }

//   const handleEdit = (activity: GNYCActivity) => {
//     setEditingId(activity.id)
//     setFormData({
//       activityName: activity.activityName,
//       category: activity.category,
//       region: activity.region,
//       year: activity.year.toString(),
//       beneficiaries: activity.beneficiaries.toString(),
//       male: activity.male.toString(),
//       female: activity.female.toString(),
//       fundingPartner: activity.fundingPartner,
//       description: activity.description,
//       status: activity.status,
//     })
//     setOpen(true)
//   }

//   const handleDelete = async () => {
//     if (!activityToDelete) return

//     const updatedData = data.filter((activity) => activity.id !== activityToDelete.id)
//     setData(updatedData)
//     setDeleteDialogOpen(false)
//     setActivityToDelete(null)
//     trackActivity("Delete", "GNYC Activity", `Deleted activity: ${activityToDelete.activityName}`)
//   }

//   const columns: ColumnDef<GNYCActivity>[] = [
//     {
//       accessorKey: "activityName",
//       header: "Activity Name",
//       cell: ({ row }) => <div className="font-medium max-w-xs">{row.getValue("activityName")}</div>,
//     },
//     {
//       accessorKey: "category",
//       header: "Category",
//       cell: ({ row }) => {
//         const category = row.getValue("category") as string
//         const Icon = getCategoryIcon(category)
//         return (
//           <div className="flex items-center gap-2">
//             <Icon className="h-4 w-4" />
//             <Badge variant="outline" className={getCategoryColor(category)}>
//               {category}
//             </Badge>
//           </div>
//         )
//       },
//     },
//     {
//       accessorKey: "year",
//       header: "Year",
//       cell: ({ row }) => (
//         <Badge variant="outline" className="bg-gray-100 text-gray-800">
//           {row.getValue("year")}
//         </Badge>
//       ),
//     },
//     {
//       accessorKey: "region",
//       header: "Region",
//       cell: ({ row }) => (
//         <div className="flex items-center gap-1">
//           <MapPin className="h-3 w-3 text-gray-500" />
//           <span className="text-sm">{row.getValue("region")}</span>
//         </div>
//       ),
//     },
//     {
//       accessorKey: "beneficiaries",
//       header: "Beneficiaries",
//       cell: ({ row }) => {
//         const value = safeNumber(row.getValue("beneficiaries"))
//         return <div className="text-center font-bold text-gray-900">{value.toLocaleString()}</div>
//       },
//     },
//     {
//       accessorKey: "male",
//       header: "Male",
//       cell: ({ row }) => {
//         const value = safeNumber(row.getValue("male"))
//         return <div className="text-center font-medium text-blue-600">{value.toLocaleString()}</div>
//       },
//     },
//     {
//       accessorKey: "female",
//       header: "Female",
//       cell: ({ row }) => {
//         const value = safeNumber(row.getValue("female"))
//         return <div className="text-center font-medium text-pink-600">{value.toLocaleString()}</div>
//       },
//     },
//     {
//       accessorKey: "fundingPartner",
//       header: "Funding Partner",
//       cell: ({ row }) => {
//         const funder = row.getValue("fundingPartner") as string
//         return (
//           <Badge variant="outline" className={getFunderColor(funder)}>
//             {funder}
//           </Badge>
//         )
//       },
//     },
//     {
//       accessorKey: "status",
//       header: "Status",
//       cell: ({ row }) => {
//         const status = row.getValue("status") as string
//         return (
//           <Badge variant="outline" className={getStatusColor(status)}>
//             {status}
//           </Badge>
//         )
//       },
//     },
//     {
//       id: "actions",
//       header: "Actions",
//       cell: ({ row }) => {
//         const activity = row.original
//         return (
//           <CanEditWrapper>
//             <div className="flex items-center gap-2">
//               <Button variant="ghost" size="sm" onClick={() => handleEdit(activity)}>
//                 <Edit className="h-4 w-4" />
//               </Button>
//               <Button
//                 variant="ghost"
//                 size="sm"
//                 onClick={() => {
//                   setActivityToDelete(activity)
//                   setDeleteDialogOpen(true)
//                 }}
//               >
//                 <Trash2 className="h-4 w-4 text-blue-600" />
//               </Button>
//             </div>
//           </CanEditWrapper>
//         )
//       },
//     },
//   ]

//   // Don't render until data is loaded
//   if (!isLoaded) {
//     return (
//       <div className="container mx-auto py-10">
//         <div className="flex items-center justify-center h-96">
//           <div className="text-center">
//             <div className="text-lg font-medium">Loading GNYC Activities...</div>
//           </div>
//         </div>
//       </div>
//     )
//   }

//   return (
//     <div className="container mx-auto py-10">
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-3xl font-bold">GNYC Activities Management</h1>
//           <p className="text-gray-600 mt-1">Gambia National Youth Council Programs & Activities</p>
//         </div>
//         <div className="flex gap-2">
//           <DataImportDialog tableName="gnyc_activities" onImportComplete={() => window.location.reload()} />
//           <CanEditWrapper>
//             <Dialog open={open} onOpenChange={setOpen}>
//               <DialogTrigger asChild>
//                 <Button>
//                   <PlusCircle className="mr-2 h-4 w-4" />
//                   Add New Activity
//                 </Button>
//               </DialogTrigger>
//               <DialogContent className="sm:max-w-[600px]">
//                 <form onSubmit={handleSubmit}>
//                   <DialogHeader>
//                     <DialogTitle>{editingId ? "Edit GNYC Activity" : "Add New GNYC Activity"}</DialogTitle>
//                     <DialogDescription>
//                       {editingId ? "Update the activity details." : "Fill in the details for the new activity."}
//                     </DialogDescription>
//                   </DialogHeader>
//                   <div className="grid gap-4 py-4">
//                     <div className="grid grid-cols-2 gap-4">
//                       <div className="space-y-2 col-span-2">
//                         <Label htmlFor="activityName">Activity Name</Label>
//                         <Input
//                           id="activityName"
//                           name="activityName"
//                           value={formData.activityName}
//                           onChange={handleInputChange}
//                           required
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="category">Category</Label>
//                         <Select
//                           value={formData.category}
//                           onValueChange={(value) => handleSelectChange("category", value)}
//                         >
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select category" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="Leadership Development">Leadership Development</SelectItem>
//                             <SelectItem value="Skills Development">Skills Development</SelectItem>
//                             <SelectItem value="Entrepreneurship">Entrepreneurship</SelectItem>
//                             <SelectItem value="Environmental">Environmental</SelectItem>
//                             <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
//                             <SelectItem value="Arts & Culture">Arts & Culture</SelectItem>
//                             <SelectItem value="Sports & Recreation">Sports & Recreation</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="region">Region</Label>
//                         <Select value={formData.region} onValueChange={(value) => handleSelectChange("region", value)}>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select region" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="GBA">Greater Banjul Area (GBA)</SelectItem>
//                             <SelectItem value="KM">Kanifing (KM)</SelectItem>
//                             <SelectItem value="WCR">West Coast Region (WCR)</SelectItem>
//                             <SelectItem value="NBR">North Bank Region (NBR)</SelectItem>
//                             <SelectItem value="LRR">Lower River Region (LRR)</SelectItem>
//                             <SelectItem value="CRR">Central River Region (CRR)</SelectItem>
//                             <SelectItem value="URR">Upper River Region (URR)</SelectItem>
//                             <SelectItem value="National">National</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="year">Year</Label>
//                         <Select value={formData.year} onValueChange={(value) => handleSelectChange("year", value)}>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select year" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="2022">2022</SelectItem>
//                             <SelectItem value="2023">2023</SelectItem>
//                             <SelectItem value="2024">2024</SelectItem>
//                             <SelectItem value="2025">2025</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="fundingPartner">Funding Partner</Label>
//                         <Select
//                           value={formData.fundingPartner}
//                           onValueChange={(value) => handleSelectChange("fundingPartner", value)}
//                         >
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select funder" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="UNDP">UNDP</SelectItem>
//                             <SelectItem value="EU">European Union</SelectItem>
//                             <SelectItem value="World Bank">World Bank</SelectItem>
//                             <SelectItem value="GEF">Global Environment Facility</SelectItem>
//                             <SelectItem value="WHO">World Health Organization</SelectItem>
//                             <SelectItem value="UNESCO">UNESCO</SelectItem>
//                             <SelectItem value="FIFA Foundation">FIFA Foundation</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="beneficiaries">Total Beneficiaries</Label>
//                         <Input
//                           id="beneficiaries"
//                           name="beneficiaries"
//                           type="number"
//                           value={formData.beneficiaries}
//                           onChange={handleInputChange}
//                           min="0"
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="male">Male Participants</Label>
//                         <Input
//                           id="male"
//                           name="male"
//                           type="number"
//                           value={formData.male}
//                           onChange={handleInputChange}
//                           min="0"
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="female">Female Participants</Label>
//                         <Input
//                           id="female"
//                           name="female"
//                           type="number"
//                           value={formData.female}
//                           onChange={handleInputChange}
//                           min="0"
//                         />
//                       </div>
//                       <div className="space-y-2">
//                         <Label htmlFor="status">Status</Label>
//                         <Select value={formData.status} onValueChange={(value) => handleSelectChange("status", value)}>
//                           <SelectTrigger>
//                             <SelectValue placeholder="Select status" />
//                           </SelectTrigger>
//                           <SelectContent>
//                             <SelectItem value="Completed">Completed</SelectItem>
//                             <SelectItem value="Ongoing">Ongoing</SelectItem>
//                             <SelectItem value="Planned">Planned</SelectItem>
//                           </SelectContent>
//                         </Select>
//                       </div>
//                       <div className="space-y-2 col-span-2">
//                         <Label htmlFor="description">Description</Label>
//                         <Textarea
//                           id="description"
//                           name="description"
//                           value={formData.description}
//                           onChange={handleInputChange}
//                           required
//                           rows={3}
//                         />
//                       </div>
//                     </div>
//                   </div>
//                   <DialogFooter>
//                     <Button type="submit">{editingId ? "Update Activity" : "Save Activity"}</Button>
//                   </DialogFooter>
//                 </form>
//               </DialogContent>
//             </Dialog>
//           </CanEditWrapper>
//         </div>
//       </div>

//       <Tabs defaultValue="overview" className="space-y-6">
//         <TabsList className="grid w-full grid-cols-4">
//           <TabsTrigger value="overview" className="flex items-center gap-2">
//             <Target className="h-4 w-4" />
//             Overview
//           </TabsTrigger>
//           <TabsTrigger value="analytics" className="flex items-center gap-2">
//             <TrendingUp className="h-4 w-4" />
//             Analytics
//           </TabsTrigger>
//           <TabsTrigger value="organizations" className="flex items-center gap-2">
//             <Building2 className="h-4 w-4" />
//             Organizations
//           </TabsTrigger>
//           <TabsTrigger value="activities" className="flex items-center gap-2">
//             <Calendar className="h-4 w-4" />
//             Activities
//           </TabsTrigger>
//         </TabsList>

//         <TabsContent value="overview" className="space-y-6">
//           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Total Activities</CardTitle>
//                 <Calendar className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{filteredData.length}</div>
//                 <p className="text-xs text-muted-foreground">Across all programs</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Total Beneficiaries</CardTitle>
//                 <Users className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold">{totalBeneficiaries.toLocaleString()}</div>
//                 <p className="text-xs text-muted-foreground">Youth reached</p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Male Participants</CardTitle>
//                 <Users className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold text-blue-600">{totalMale.toLocaleString()}</div>
//                 <p className="text-xs text-muted-foreground">
//                   {totalBeneficiaries > 0 ? Math.round((totalMale / totalBeneficiaries) * 100) : 0}% of total
//                 </p>
//               </CardContent>
//             </Card>
//             <Card>
//               <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
//                 <CardTitle className="text-sm font-medium">Female Participants</CardTitle>
//                 <Users className="h-4 w-4 text-muted-foreground" />
//               </CardHeader>
//               <CardContent>
//                 <div className="text-2xl font-bold text-pink-600">{totalFemale.toLocaleString()}</div>
//                 <p className="text-xs text-muted-foreground">
//                   {totalBeneficiaries > 0 ? Math.round((totalFemale / totalBeneficiaries) * 100) : 0}% of total
//                 </p>
//               </CardContent>
//             </Card>
//           </div>

//           <Card>
//             <CardHeader>
//               <CardTitle>Yearly Activity Trends</CardTitle>
//               <CardDescription>Activities and beneficiaries by year</CardDescription>
//             </CardHeader>
//             <CardContent>
//               <ResponsiveContainer width="100%" height={400}>
//                 <BarChart data={yearlyData}>
//                   <CartesianGrid strokeDasharray="3 3" />
//                   <XAxis dataKey="year" />
//                   <YAxis yAxisId="left" />
//                   <YAxis yAxisId="right" orientation="right" />
//                   <Tooltip />
//                   <Legend />
//                   <Bar yAxisId="left" dataKey="activities" fill="#3B82F6" name="Activities" />
//                   <Bar yAxisId="right" dataKey="beneficiaries" fill="#10B981" name="Beneficiaries" />
//                 </BarChart>
//               </ResponsiveContainer>
//             </CardContent>
//           </Card>
//         </TabsContent>

//         <TabsContent value="analytics" className="space-y-6">
//           <div className="grid gap-6 md:grid-cols-2">
//             <Card>
//               <CardHeader>
//                 <CardTitle>Activities by Category</CardTitle>
//                 <CardDescription>Distribution of activities across categories</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={categoryData}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       {categoryData.map((entry, index) => (
//                         <Cell key={`cell-${index}`} fill={entry.color} />
//                       ))}
//                     </Pie>
//                     <Tooltip formatter={(value) => safeNumber(value).toLocaleString()} />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>

//             <Card>
//               <CardHeader>
//                 <CardTitle>Gender Distribution</CardTitle>
//                 <CardDescription>Male vs Female participation</CardDescription>
//               </CardHeader>
//               <CardContent>
//                 <ResponsiveContainer width="100%" height={300}>
//                   <PieChart>
//                     <Pie
//                       data={[
//                         { name: "Male", value: totalMale, color: "#3B82F6" },
//                         { name: "Female", value: totalFemale, color: "#EC4899" },
//                       ]}
//                       cx="50%"
//                       cy="50%"
//                       labelLine={false}
//                       label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
//                       outerRadius={80}
//                       fill="#8884d8"
//                       dataKey="value"
//                     >
//                       <Cell fill="#3B82F6" />
//                       <Cell fill="#EC4899" />
//                     </Pie>
//                     <Tooltip formatter={(value) => safeNumber(value).toLocaleString()} />
//                   </PieChart>
//                 </ResponsiveContainer>
//               </CardContent>
//             </Card>
//           </div>
//         </TabsContent>

//         <TabsContent value="organizations" className="space-y-6">
//           <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-2">
//             {youthOrganizations.map((org) => (
//               <Card key={org.id} className="relative overflow-hidden">
//                 <CardHeader className="pb-3">
//                   <div className="flex items-center justify-between">
//                     <div className="flex items-center gap-3">
//                       <div className="p-2 rounded-lg bg-blue-100">
//                         <Building2 className="h-6 w-6 text-blue-600" />
//                       </div>
//                       <div>
//                         <CardTitle className="text-lg">{org.name}</CardTitle>
//                         <CardDescription className="text-sm">{org.fullName}</CardDescription>
//                       </div>
//                     </div>
//                   </div>
//                 </CardHeader>
//                 <CardContent className="space-y-4">
//                   <p className="text-sm text-gray-600">{org.description}</p>

//                   <div className="grid grid-cols-3 gap-4 text-center">
//                     <div>
//                       <div className="text-2xl font-bold text-gray-900">{org.members.toLocaleString()}</div>
//                       <div className="text-xs text-gray-500">Members</div>
//                     </div>
//                     <div>
//                       <div className="text-2xl font-bold text-blue-600">{org.established}</div>
//                       <div className="text-xs text-gray-500">Established</div>
//                     </div>
//                     <div>
//                       <div className="text-2xl font-bold text-green-600">{org.activities.length}</div>
//                       <div className="text-xs text-gray-500">Focus Areas</div>
//                     </div>
//                   </div>

//                   <div className="space-y-2">
//                     <div className="text-sm font-medium">Focus Areas:</div>
//                     <div className="flex flex-wrap gap-1">
//                       {org.activities.map((activity, index) => (
//                         <Badge key={index} variant="outline" className="text-xs">
//                           {activity}
//                         </Badge>
//                       ))}
//                     </div>
//                   </div>

//                   <div className="space-y-1 text-xs text-gray-500">
//                     <div>📧 {org.contact.email}</div>
//                     <div>📞 {org.contact.phone}</div>
//                     <div>📍 {org.contact.address}</div>
//                   </div>
//                 </CardContent>
//               </Card>
//             ))}
//           </div>
//         </TabsContent>

//         <TabsContent value="activities" className="space-y-6">
//           <div className="flex flex-wrap gap-4 p-4 bg-gray-50 rounded-lg">
//             <div className="flex items-center gap-2">
//               <Label htmlFor="category-filter">Category:</Label>
//               <Select value={selectedCategory} onValueChange={setSelectedCategory}>
//                 <SelectTrigger className="w-48">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Categories</SelectItem>
//                   <SelectItem value="Leadership Development">Leadership Development</SelectItem>
//                   <SelectItem value="Skills Development">Skills Development</SelectItem>
//                   <SelectItem value="Entrepreneurship">Entrepreneurship</SelectItem>
//                   <SelectItem value="Environmental">Environmental</SelectItem>
//                   <SelectItem value="Health & Wellness">Health & Wellness</SelectItem>
//                   <SelectItem value="Arts & Culture">Arts & Culture</SelectItem>
//                   <SelectItem value="Sports & Recreation">Sports & Recreation</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex items-center gap-2">
//               <Label htmlFor="region-filter">Region:</Label>
//               <Select value={selectedRegion} onValueChange={setSelectedRegion}>
//                 <SelectTrigger className="w-32">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Regions</SelectItem>
//                   <SelectItem value="GBA">GBA</SelectItem>
//                   <SelectItem value="KM">KM</SelectItem>
//                   <SelectItem value="WCR">WCR</SelectItem>
//                   <SelectItem value="NBR">NBR</SelectItem>
//                   <SelectItem value="LRR">LRR</SelectItem>
//                   <SelectItem value="CRR">CRR</SelectItem>
//                   <SelectItem value="URR">URR</SelectItem>
//                   <SelectItem value="National">National</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>

//             <div className="flex items-center gap-2">
//               <Label htmlFor="year-filter">Year:</Label>
//               <Select value={selectedYear} onValueChange={setSelectedYear}>
//                 <SelectTrigger className="w-24">
//                   <SelectValue />
//                 </SelectTrigger>
//                 <SelectContent>
//                   <SelectItem value="all">All Years</SelectItem>
//                   <SelectItem value="2022">2022</SelectItem>
//                   <SelectItem value="2023">2023</SelectItem>
//                   <SelectItem value="2024">2024</SelectItem>
//                 </SelectContent>
//               </Select>
//             </div>
//           </div>

//           <DataTable columns={columns} data={filteredData} searchKey="activityName" filename="gnyc-activities" />
//         </TabsContent>
//       </Tabs>

//       <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
//         <DialogContent>
//           <DialogHeader>
//             <DialogTitle>Confirm Deletion</DialogTitle>
//             <DialogDescription>
//               Are you sure you want to delete the activity "{activityToDelete?.activityName}"? This action cannot be
//               undone.
//             </DialogDescription>
//           </DialogHeader>
//           <DialogFooter>
//             <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
//               Cancel
//             </Button>
//             <Button variant="destructive" onClick={handleDelete}>
//               Delete
//             </Button>
//           </DialogFooter>
//         </DialogContent>
//       </Dialog>
//     </div>
//   )
// }

export default function GNYCActivitiesPage() {
  return <div>GNYCActivitiesPage</div>;
}
