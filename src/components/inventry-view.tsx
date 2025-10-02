'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Plus, Loader2, Package, AlertTriangle, BellRing, Filter, X, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

// 1. IMPORTING SCHEMA AND TYPE FROM EXTERNAL FILE
import { inventorySchema, type InventoryInput } from '~/lib/validations/inventory';

// --- UI Imports ---
import { Button } from '~/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '~/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '~/components/ui/form';
import { Input } from '~/components/ui/input';
import { Table, TableBody, TableHead, TableHeader, TableRow, TableCell } from '~/components/ui/table';
import { Card, CardHeader, CardTitle, CardContent } from '~/components/ui/card';
import { Toaster } from '~/components/ui/sonner'; 
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '~/components/ui/tooltip'; 

// 2. TypeScript Interface (Must match the fields in inventorySchema + database fields)
interface InventoryItem {
    id: string; 
    name: string;
    unit: string;
    description: string | null;
    currentStock: number;
    reorderPoint: number; 
    pricePerUnit: number;
    supplier: string | null;
    createdAt: string;
    updatedAt: string;
}

// --- Frontend Component ---

const API_ROUTE = '/api/pharmacy/inventory';

export function InventoryView() {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isNewModalOpen, setIsNewModalOpen] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [filterLowStock, setFilterLowStock] = useState(false);

    // 💡 NEW STATE: For managing the item being edited/deleted
    const [itemToEdit, setItemToEdit] = useState<InventoryItem | null>(null);
    const [itemToDelete, setItemToDelete] = useState<InventoryItem | null>(null);
    
    // Determine if the main dialog is for adding new or editing
    const isEditModalOpen = !!itemToEdit;
    const isFormOpen = isNewModalOpen || isEditModalOpen;

    // Form setup - uses the same form for both creation and editing
    const inventoryForm = useForm<InventoryInput>({
        resolver: zodResolver(inventorySchema),
        // Use an empty object for default values, Zod/RHF will fill based on schema.
        // We will use RHF's reset() or setValue() for pre-filling on edit.
        defaultValues: {
            name: '',
            unit: '',
            description: '',
            supplier: '',
            currentStock: 0,
            reorderPoint: 10,
            pricePerUnit: 0.00, 
        },
    });

    // 💡 NEW EFFECT: Load data into the form when an item is selected for editing
    useEffect(() => {
        if (itemToEdit) {
            // Reset the form with the current item's values
            inventoryForm.reset({
                name: itemToEdit.name,
                unit: itemToEdit.unit,
                description: itemToEdit.description || '',
                supplier: itemToEdit.supplier || '',
                currentStock: itemToEdit.currentStock,
                reorderPoint: itemToEdit.reorderPoint,
                pricePerUnit: itemToEdit.pricePerUnit,
            });
        } else if (isNewModalOpen) {
             // Reset to default values when opening the 'Add New' form
             inventoryForm.reset({
                name: '',
                unit: '',
                description: '',
                supplier: '',
                currentStock: 0,
                reorderPoint: 10,
                pricePerUnit: 0.00, 
             });
        }
    }, [itemToEdit, isNewModalOpen, inventoryForm]);


    /**
     * Fetches all inventory items from the backend GET endpoint.
     */
    const fetchInventory = useCallback(async () => {
        // ... (fetch logic remains the same)
        setIsLoading(true);
        setError(null);
        try {
            const response = await fetch(API_ROUTE, { cache: 'no-store' });
            
            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ error: 'Failed to fetch inventory data.' }));
                throw new Error(errorBody.error || 'Failed to fetch inventory data.');
            }
            
            const data: InventoryItem[] = await response.json();
            setInventory(data);
        } catch (err: any) {
            console.error('Fetch error:', err);
            toast.error(err.message || 'An unknown error occurred.', {
                description: 'Please check the console for details.',
                duration: 5000,
            });
            setError(err.message || 'An unknown error occurred while fetching inventory.');
            setInventory([]);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchInventory();
    }, [fetchInventory]);

    /**
     * Master submission handler for both Create (POST) and Edit (PATCH).
     */
    const handleFormSubmit = async (data: InventoryInput) => {
        const isEditing = !!itemToEdit;
        const method = isEditing ? 'PATCH' : 'POST';
        const url = isEditing ? `${API_ROUTE}/${itemToEdit?.id}` : API_ROUTE;
        const actionText = isEditing ? 'Update' : 'Create';

        try {
            const payload = {
                ...data,
                description: data.description || null,
                supplier: data.supplier || null,
            };

            const response = await fetch(url, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload),
            });

            const result = await response.json();

            if (!response.ok) {
                const errorMessage = result.error || result.details?._errors?.join(', ') || `Failed to ${actionText.toLowerCase()} inventory item.`;
                toast.error(`${actionText} Failed`, { description: errorMessage, duration: 5000 });
                return;
            }

            toast.success("Success! 🎉", {
                description: `Item '${result.name}' successfully ${actionText.toLowerCase()}d.`,
                duration: 3000,
            });
            
            // Update local state based on action
            if (isEditing) {
                setInventory(prev => prev.map(item => item.id === result.id ? result as InventoryItem : item));
                setItemToEdit(null); // Close the edit modal
            } else {
                setInventory(prev => [...prev, result as InventoryItem].sort((a, b) => a.name.localeCompare(b.name)));
                setIsNewModalOpen(false); // Close the new item modal
            }
            inventoryForm.reset();

        } catch (error) {
            console.error(`Error in ${method} request:`, error);
            toast.error("Error", {
                description: `An unexpected error occurred during ${actionText.toLowerCase()}.`,
                duration: 5000,
            });
        }
    };
    
    /**
     * Handles the actual DELETE request after confirmation.
     */
    const handleConfirmDelete = async () => {
        if (!itemToDelete) return;
        
        const itemId = itemToDelete.id;
        const itemName = itemToDelete.name;

        setItemToDelete(null); // Close the confirmation modal immediately

        try {
            const response = await fetch(`${API_ROUTE}/${itemId}`, {
                method: 'DELETE',
            });

            if (!response.ok) {
                const errorBody = await response.json().catch(() => ({ error: `Failed to delete item ${itemName}.` }));
                throw new Error(errorBody.error || `Failed to delete item ${itemName}.`);
            }

            toast.success("Deleted! 🗑️", {
                description: `Item '${itemName}' has been removed from inventory.`,
                duration: 3000,
            });
            
            // Remove item from local state
            setInventory(prev => prev.filter(item => item.id !== itemId));

        } catch (error: any) {
            console.error('Error in DELETE request:', error);
            toast.error("Deletion Failed", {
                description: error.message || "An unexpected error occurred during deletion.",
                duration: 5000,
            });
        }
    };

    // Low Stock Filter Logic
    const filteredInventory = useMemo(() => {
        if (filterLowStock) {
            return inventory.filter(item => item.currentStock <= item.reorderPoint);
        }
        return inventory;
    }, [inventory, filterLowStock]);
    
    // 💡 UPDATED FUNCTION: Sets the item for editing and opens the dialog
    const handleEdit = (item: InventoryItem) => {
        setItemToEdit(item);
        setIsNewModalOpen(false); // Ensure "New" is closed
    };

    // 💡 UPDATED FUNCTION: Sets the item for deletion and opens the confirmation dialog
    const handleDelete = (item: InventoryItem) => {
        setItemToDelete(item);
    };


    const renderInventoryList = () => {
        // ... (loading, error, empty state logic remains the same)
        if (isLoading) {
            return (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-3 text-lg text-muted-foreground">Loading inventory...</span>
                </div>
            );
        }

        if (error) {
             return (
                <Card className="border-red-500 bg-red-50">
                    <CardHeader>
                        <CardTitle className="text-red-700 flex items-center">
                            <AlertTriangle className="h-5 w-5 mr-2" /> Error Loading Data
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-red-600">{error}</p>
                        <Button variant="outline" className="mt-4" onClick={fetchInventory}>
                            Try Again
                        </Button>
                    </CardContent>
                </Card>
            );
        }
        
        if (filteredInventory.length === 0) {
            return (
                <Card>
                    <CardHeader>
                        <CardTitle>No Inventory Found</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-muted-foreground">
                            {filterLowStock 
                                ? "Great! All items are above their reorder point." 
                                : "Click 'Add Item' to add the first inventory record."
                            }
                        </p>
                    </CardContent>
                </Card>
            );
        }

        return (
            <div className="border rounded-lg shadow-sm">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead className="w-[200px]">Medication Name</TableHead>
                            <TableHead className="text-right">Stock</TableHead>
                            <TableHead>Unit</TableHead>
                            <TableHead>Reorder Point</TableHead>
                            <TableHead>Price/Unit</TableHead>
                            <TableHead>Supplier</TableHead>
                            <TableHead className="text-center">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {filteredInventory.map((item) => {
                            const isLowStock = item.currentStock <= item.reorderPoint;

                            return (
                                <TableRow 
                                    key={item.id}
                                    className={isLowStock ? 'bg-yellow-50 hover:bg-yellow-100 transition-colors' : 'hover:bg-gray-50'}
                                >
                                    <TableCell className="font-semibold flex items-center">
                                        {isLowStock && (
                                            <TooltipProvider>
                                                <Tooltip>
                                                    <TooltipTrigger>
                                                        <BellRing className="h-4 w-4 mr-2 text-orange-500 animate-pulse" />
                                                    </TooltipTrigger>
                                                    <TooltipContent>
                                                        <p>Low Stock Alert!</p>
                                                    </TooltipContent>
                                                </Tooltip>
                                            </TooltipProvider>
                                        )}
                                        {item.name}
                                    </TableCell>
                                    <TableCell className={isLowStock ? 'text-right font-bold text-orange-600' : 'text-right'}>
                                        {item.currentStock}
                                    </TableCell>
                                    <TableCell className="text-muted-foreground">
                                        {item.unit}
                                    </TableCell>
                                    <TableCell>
                                        {item.reorderPoint}
                                    </TableCell>
                                    <TableCell className="font-mono">${item.pricePerUnit.toFixed(2)}</TableCell>
                                    <TableCell className="text-muted-foreground max-w-sm truncate">
                                        {item.supplier || 'N/A'}
                                    </TableCell>
                                    <TableCell className="text-center w-[120px]">
                                        <div className="flex justify-center space-x-2">
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleEdit(item)}
                                                aria-label={`Edit ${item.name}`}
                                            >
                                                <Edit className="h-4 w-4 text-blue-500" />
                                            </Button>
                                            <Button 
                                                variant="ghost" 
                                                size="sm" 
                                                onClick={() => handleDelete(item)}
                                                aria-label={`Delete ${item.name}`}
                                            >
                                                <Trash2 className="h-4 w-4 text-red-500" />
                                            </Button>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            );
                        })}
                    </TableBody>
                </Table>
            </div>
        );
    };


    return (
        <div className="space-y-6 p-6 max-w-7xl mx-auto">
            {/* Header Section */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-balance flex items-center">
                        <Package className="mr-3 h-8 w-8 text-primary" />
                        Pharmacy Inventory
                    </h1>
                    <p className="text-muted-foreground">Manage stock levels, reorder points, and unit prices for all medications.</p>
                </div>
                <div className="flex space-x-3">
                    <Button 
                        variant={filterLowStock ? "default" : "outline"} 
                        onClick={() => setFilterLowStock(prev => !prev)}
                        className={filterLowStock ? "bg-orange-500 hover:bg-orange-600 text-white" : "border-orange-500 text-orange-600 hover:bg-orange-50"}
                    >
                        {filterLowStock ? <X className="mr-2 h-4 w-4" /> : <Filter className="mr-2 h-4 w-4" />}
                        Low Stock ({inventory.filter(item => item.currentStock <= item.reorderPoint).length})
                    </Button>

                    <Button onClick={() => { setIsNewModalOpen(true); setItemToEdit(null); }} className="flex items-center">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Item
                    </Button>
                </div>
            </div>

            <hr className="my-4" />
            
            {/* Inventory List */}
            {renderInventoryList()}

            {/* Toaster for notifications */}
            <Toaster />

            {/* 💡 MODAL FOR BOTH NEW AND EDIT */}
            <Dialog 
                open={isFormOpen} 
                onOpenChange={(open) => {
                    if (isEditModalOpen) setItemToEdit(null);
                    else setIsNewModalOpen(open);
                }}
            >
                <DialogContent className="sm:max-w-[425px]">
                    <DialogHeader>
                        <DialogTitle>{isEditModalOpen ? `Edit: ${itemToEdit?.name}` : "Add New Inventory Item"}</DialogTitle>
                        <DialogDescription>
                            {isEditModalOpen ? "Update the details for this inventory item." : "Enter the details for a new medication or supply item."}
                        </DialogDescription>
                    </DialogHeader>
                    <Form {...inventoryForm}>
                        <form onSubmit={inventoryForm.handleSubmit(handleFormSubmit)} className="space-y-4">
                            {/* Form Fields - using `inventoryForm.control` */}
                            <FormField
                                control={inventoryForm.control}
                                name="name"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Medication Name</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., Amoxicillin 500mg" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={inventoryForm.control}
                                    name="unit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Unit</FormLabel>
                                            <FormControl>
                                                <Input placeholder="e.g., tablet, bottle" {...field} />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={inventoryForm.control}
                                    name="currentStock"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Current Stock</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    placeholder="0" 
                                                    {...field} 
                                                    // Handle string to number conversion for RHF/Zod compatibility
                                                    onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} 
                                                    value={field.value === 0 && !isEditModalOpen ? '' : field.value} 
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FormField
                                    control={inventoryForm.control}
                                    name="reorderPoint"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Reorder Point</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    placeholder="10" 
                                                    {...field}
                                                    onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} 
                                                    value={field.value === 0 && !isEditModalOpen ? '' : field.value}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                                <FormField
                                    control={inventoryForm.control}
                                    name="pricePerUnit"
                                    render={({ field }) => (
                                        <FormItem>
                                            <FormLabel>Price/Unit ($)</FormLabel>
                                            <FormControl>
                                                <Input 
                                                    type="number" 
                                                    step="0.01" 
                                                    placeholder="0.00" 
                                                    {...field}
                                                    onChange={e => field.onChange(e.target.value === '' ? '' : Number(e.target.value))} 
                                                    value={field.value === 0 && !isEditModalOpen ? '' : field.value}
                                                />
                                            </FormControl>
                                            <FormMessage />
                                        </FormItem>
                                    )}
                                />
                            </div>
                            <FormField
                                control={inventoryForm.control}
                                name="supplier"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Supplier (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="e.g., MedCorp Distributors" {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />
                            <FormField
                                control={inventoryForm.control}
                                name="description"
                                render={({ field }) => (
                                    <FormItem>
                                        <FormLabel>Description (Optional)</FormLabel>
                                        <FormControl>
                                            <Input placeholder="Lot number, storage info, etc." {...field} />
                                        </FormControl>
                                        <FormMessage />
                                    </FormItem>
                                )}
                            />

                            <DialogFooter className="pt-4">
                                <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => {
                                        if (isEditModalOpen) setItemToEdit(null);
                                        else setIsNewModalOpen(false);
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={inventoryForm.formState.isSubmitting}>
                                    {inventoryForm.formState.isSubmitting ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                                    {isEditModalOpen ? "Save Changes" : "Add Item"}
                                </Button>
                            </DialogFooter>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>

            {/* 💡 DELETE CONFIRMATION DIALOG */}
            <Dialog open={!!itemToDelete} onOpenChange={() => setItemToDelete(null)}>
                <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                        <DialogTitle className="text-red-600 flex items-center">
                            <Trash2 className="mr-2 h-5 w-5" /> Confirm Deletion
                        </DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete **{itemToDelete?.name}**? This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setItemToDelete(null)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleConfirmDelete}>
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

        </div>
    );
}