"use client"

import { useState, useEffect, useMemo } from "react"
import { Button } from "~/components/ui/button"
import { Input } from "~/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "~/components/ui/table"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "~/components/ui/dropdown-menu"
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card"
import { Badge } from "~/components/ui/badge"
import { Plus, Search, Filter, MoreHorizontal, Eye, Edit, Trash2, Loader2, Users } from "lucide-react"

// --- FORM AND VALIDATION IMPORTS ---
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogFooter } from "~/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { patientSchema } from "~/lib/validations/patient"

type NewPatientFormValues = z.infer<typeof patientSchema>

// ----------------------------------------------------------------------
// INTERFACES AND HELPERS
// ----------------------------------------------------------------------
interface Patient {
  id: string
  firstName: string
  lastName: string
  dateOfBirth: string
  gender: 'Male' | 'Female' | 'Other'
  phone: string
  email?: string
  address: string
  CNIC: string // Updated to CNIC
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}

// ----------------------------------------------------------------------
// PATIENTS VIEW COMPONENT
// ----------------------------------------------------------------------
export function PatientsView() {
  const [patients, setPatients] = useState<Patient[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [genderFilter, setGenderFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // React Hook Form setup
  const form = useForm<NewPatientFormValues>({
    resolver: zodResolver(patientSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      dateOfBirth: "",
      gender: "Other", 
      phone: "",
      email: "",
      address: "",
      CNIC: "",
    },
  })

  // --- Data Fetching ---
  const fetchPatients = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/patients")
      if (!res.ok) {
        throw new Error("Failed to fetch patients")
      }
      const data: Patient[] = await res.json()
      setPatients(data)
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchPatients()
  }, [])

  // --- Patient Creation Submission ---
  const handleNewPatientSubmit = async (values: NewPatientFormValues) => {
    try {
      const res = await fetch("/api/patients", {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || "Failed to add new patient.");
      }

      const newPatient: Patient = await res.json();
      
      setPatients(prev => [newPatient, ...prev]); 
      
      form.reset();
      setIsModalOpen(false);
      
      console.log("Patient added successfully:", newPatient);

    } catch (error: any) {
      console.error("Submission error:", error.message);
      alert(`Error adding patient: ${error.message}`);
    }
  }

  // --- Delete Functionality ---
  const handleDeletePatient = async (patientId: string) => {
    if (!window.confirm("Are you sure you want to delete this patient record?")) {
      return;
    }

    setIsDeleting(patientId);
    try {
      const res = await fetch(`/api/patients?id=${patientId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        throw new Error("Failed to delete patient");
      }

      setPatients(prev => prev.filter(p => p.id !== patientId));
    } catch (error) {
      console.error("Deletion error:", error);
      alert("Failed to delete patient. Check console for details.");
    } finally {
      setIsDeleting(null);
    }
  };

  // --- Filtering Logic ---
  const filteredPatients = useMemo(() => {
    return patients.filter((patient) => {
      const fullName = `${patient.firstName} ${patient.lastName}`.toLowerCase()
      const matchesSearch =
        fullName.includes(searchTerm.toLowerCase()) ||
        patient.CNIC.toLowerCase().includes(searchTerm.toLowerCase()) // Filter by CNIC
      
      const matchesGender = genderFilter === "all" || patient.gender.toLowerCase() === genderFilter.toLowerCase()
      
      return matchesSearch && matchesGender
    })
  }, [patients, searchTerm, genderFilter])
  
  const activeCount = patients.length; 

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="ml-2">Loading Patient Records...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-balance">Patient Directory</h1>
          <p className="text-muted-foreground mt-1">Manage and view all patient records</p>
        </div>
        
        <Button onClick={() => setIsModalOpen(true)} className="flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>New Patient</span>
        </Button>
      </div>

      {/* --- ADD NEW PATIENT DIALOG --- */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="sm:max-w-[480px]">
          <DialogHeader>
            <DialogTitle>Add New Patient</DialogTitle>
            <DialogDescription>
              Enter the patient's full contact and medical details.
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleNewPatientSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl><Input placeholder="John" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl><Input placeholder="Smith" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="dateOfBirth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Date of Birth</FormLabel>
                      <FormControl><Input type="date" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select Gender" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Male">Male</SelectItem>
                          <SelectItem value="Female">Female</SelectItem>
                          <SelectItem value="Other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* CONTACT FIELDS */}
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone</FormLabel>
                      <FormControl><Input placeholder="+1 555 123 4567" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email (Optional)</FormLabel>
                      <FormControl><Input type="email" placeholder="john.smith@example.com" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="address"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Address</FormLabel>
                    <FormControl><Input placeholder="123 Main St, Anytown, USA" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CNIC FIELD */}
              <FormField
                control={form.control}
                name="CNIC"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CNIC (National ID)</FormLabel>
                    <FormControl><Input placeholder="12345-6789012-3" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="pt-4">
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Add Patient
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      {/* --- END ADD NEW PATIENT DIALOG --- */}


      {/* Search and Filter Bar */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search patients by name or CNIC..."
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
                  <SelectItem value="other">Other</SelectItem>
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
              {activeCount} Total
            </Badge>
          </CardTitle>
        </CardHeader>
        <CardContent className="p-3">
          <div className="w-full">
            <Table>
              <TableHeader>
                <TableRow className="border-b border-border">
                  <TableHead className="font-semibold">Name</TableHead>
                  <TableHead className="font-semibold">Date of Birth</TableHead>
                  <TableHead className="font-semibold">Gender</TableHead>
                  <TableHead className="font-semibold">CNIC</TableHead> {/* Updated Header */}
                  <TableHead className="font-semibold">Phone</TableHead> {/* Updated Header */}
                  <TableHead className="font-semibold text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient) => (
                    <TableRow key={patient.id} className="hover:bg-muted/50">
                      <TableCell className="font-medium">{patient.firstName} {patient.lastName}</TableCell>
                      <TableCell className="text-muted-foreground">{formatDate(patient.dateOfBirth)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {patient.gender}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-mono text-sm">{patient.CNIC}</TableCell> {/* Updated Cell Value */}
                      <TableCell className="font-mono text-sm">{patient.phone}</TableCell> 
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
                            <DropdownMenuItem 
                              className="flex items-center space-x-2 text-destructive focus:bg-destructive/10"
                              onClick={() => handleDeletePatient(patient.id)}
                              disabled={isDeleting === patient.id}
                            >
                              {isDeleting === patient.id ? (
                                <Loader2 className="h-4 w-4 animate-spin mr-2" />
                              ) : (
                                <Trash2 className="h-4 w-4" />
                              )}
                              <span>{isDeleting === patient.id ? 'Deleting...' : 'Delete'}</span>
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                      {searchTerm || genderFilter !== 'all'
                        ? "No patients match your current filter."
                        : "No patient records found in the system."}
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}