
'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea"; // If needed for larger note fields, currently using Inputs
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AddVpsInstanceSchema, type AddVpsInstanceInput, addVpsInstance } from "@/app/admin/actions";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";
import { PlusCircleIcon } from "lucide-react";

interface AddServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function AddServerDialog({ open, onOpenChange, onSuccess }: AddServerDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<AddVpsInstanceInput>({
    resolver: zodResolver(AddVpsInstanceSchema),
    defaultValues: {
      name: "",
      type: "",
      group_name: "",
      ip_address: "",
      country_region: "",
      note_billing_start_date: "",
      note_billing_end_date: "",
      note_billing_cycle: "",
      note_billing_amount: "",
      note_plan_bandwidth: "",
      note_plan_traffic_type: 0, // Default to "Both"
    },
  });

  const onSubmit = async (data: AddVpsInstanceInput) => {
    setIsSubmitting(true);
    try {
      const result = await addVpsInstance(data);
      if (result.success) {
        toast({ title: "Success", description: "VPS instance added successfully." });
        form.reset();
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast({ title: "Error", description: result.error || "Failed to add VPS instance.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <PlusCircleIcon className="mr-2 h-6 w-6" /> Add New Server
          </DialogTitle>
          <DialogDescription>
            Fill in the details for the new VPS instance. The secret and install command will be generated automatically.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* VPS Details */}
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
              <Input id="name" {...form.register("name")} placeholder="e.g., Production Server 1" />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input id="type" {...form.register("type")} placeholder="e.g., Premium KVM" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group_name">Group</Label>
              <Input id="group_name" {...form.register("group_name")} placeholder="e.g., Web Servers" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ip_address">IP Address</Label>
              <Input id="ip_address" {...form.register("ip_address")} placeholder="e.g., 192.168.1.100" />
              {form.formState.errors.ip_address && <p className="text-xs text-destructive">{form.formState.errors.ip_address.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="country_region">Country/Region</Label>
              <Input id="country_region" {...form.register("country_region")} placeholder="e.g., USA / New York" />
            </div>
          </div>

          {/* Billing Data */}
          <h3 className="text-lg font-medium pt-4 border-t mt-4">Billing Data (Note)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="note_billing_start_date">Start Date</Label>
              <Input id="note_billing_start_date" type="date" {...form.register("note_billing_start_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note_billing_end_date">End Date</Label>
              <Input id="note_billing_end_date" type="date" {...form.register("note_billing_end_date")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note_billing_cycle">Cycle</Label>
              <Input id="note_billing_cycle" {...form.register("note_billing_cycle")} placeholder="e.g., Monthly, Annually" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note_billing_amount">Amount</Label>
              <Input id="note_billing_amount" {...form.register("note_billing_amount")} placeholder="e.g., $10.00 USD" />
            </div>
          </div>

          {/* Plan Data */}
          <h3 className="text-lg font-medium pt-4 border-t mt-4">Plan Data (Note)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="note_plan_bandwidth">Bandwidth</Label>
              <Input id="note_plan_bandwidth" {...form.register("note_plan_bandwidth")} placeholder="e.g., 1TB, 500GB" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note_plan_traffic_type">Traffic Type</Label>
              <Select
                onValueChange={(value) => form.setValue("note_plan_traffic_type", parseInt(value))}
                defaultValue={form.getValues("note_plan_traffic_type")?.toString() || "0"}
              >
                <SelectTrigger id="note_plan_traffic_type">
                  <SelectValue placeholder="Select traffic type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Both</SelectItem>
                  <SelectItem value="1">Outbound only</SelectItem>
                  <SelectItem value="2">Inbound only</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter className="pt-6">
            <DialogClose asChild>
                <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Adding..." : "Add Server"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
