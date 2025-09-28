"use client"

import { useState } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2 } from "lucide-react"

// Mock patient data
const patients = [
  {
    id: "MR001",
    name: "Emily Rodriguez",
    dateOfBirth: "1985-03-15",
    gender: "Female",
    medicalRecordId: "MR-2024-001",
    lastVisit: "2024-01-15",
    status: "Active",
  },
  {
    id: "MR002",
    name: "Michael Chen",
    dateOfBirth: "1978-11-22",
    gender: "Male",
    medicalRecordId: "MR-2024-002",
    lastVisit: "2024-01-10",
    status: "Active",
  },
  {
    id: "MR003",
    name: "Sarah Williams",
    dateOfBirth: "1992-07-08",
    gender: "Female",
    medicalRecordId: "MR-2024-003",
    lastVisit: "2023-12-20",
    status: "Inactive",
  },
  {
    id: "MR004",
    name: "David Thompson",
    dateOfBirth: "1965-09-12",
    gender: "Male",
    medicalRecordId: "MR-2024-004",
    lastVisit: "2024-01-18",
    status: "Active",
  },
  {
    id: "MR005",
    name: "Lisa Anderson",
    dateOfBirth: "1988-04-25",
    gender: "Female",
    medicalRecordId: "MR-2024-005",
    lastVisit: "2024-01-12",
    status: "Active",
  },
]

export function PatientsView() {
  const [searchTerm, setSearchTerm] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")

  const filteredPatients = patients.filter((patient) => {
    const matchesSearch =
      patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      patient.medicalRecordId.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesGender = genderFilter === "all" || patient.gender.toLowerCase() === genderFilter
    return matchesSearch && matchesGender
  })

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Patient Directory</h1>
          <p className="text-muted-foreground mt-1">Manage and view all patient records</p>
        </div>
        <Button className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Patient</span>
        </Button>
      </div>

      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or medical record ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={genderFilter} onValueChange={setGenderFilter}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Genders</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Patients Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Patients ({filteredPatients.length})</span>
            <Badge variant="secondary" className="text-xs">
              {patients.filter((p) => p.status === "Active").length} Active
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Date of Birth</TableHead>
                  <TableHead className="font-semibold">Gender</TableHead>
                  <TableHead className="font-semibold">Medical Record ID</TableHead>
                  <TableHead className="font-semibold">Status</TableHead>
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-muted/50">
                    <TableCell className="font-medium">{patient.name}</TableCell>
                    <TableCell className="text-muted-foreground">{formatDate(patient.dateOfBirth)}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {patient.gender}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">{patient.medicalRecordId}</TableCell>
                    <TableCell>
                      <Badge variant={patient.status === "Active" ? "default" : "secondary"} className="text-xs">
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuItem className="flex items-center space-x-2">
                            <Eye className="h-4 w-4" />
                            <span>View Details</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center space-x-2">
                            <Edit className="h-4 w-4" />
                            <span>Edit</span>
                          </DropdownMenuItem>
                          <DropdownMenuItem className="flex items-center space-x-2 text-destructive">
                            <Trash2 className="h-4 w-4" />
                            <span>Delete</span>
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
