
'use client';

import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { updateVpsInstance, getVpsInstanceById } from "@/app/admin/actions"; // Assuming updateVpsInstance exists
import { EditVpsInstanceSchema, type EditVpsInstanceInput, type VpsAdminEntry } from "@/app/admin/definitions";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { FilePenLineIcon, Loader2Icon } from "lucide-react";

interface EditServerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vps: VpsAdminEntry | null;
  onSuccess?: () => void;
}

export function EditServerDialog({ open, onOpenChange, vps: initialVps, onSuccess }: EditServerDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingVps, setIsLoadingVps] = useState(false);

  const form = useForm<EditVpsInstanceInput>({
    resolver: zodResolver(EditVpsInstanceSchema),
    defaultValues: { // Default values will be overridden by fetched VPS data
      id: 0, // Will be set from vps prop
      name: "",
      type: "",
      group_name: "",
      country_region: "",
      note_billing_start_date: "",
      note_billing_end_date: "",
      note_billing_cycle: "",
      note_billing_amount: "",
      note_plan_bandwidth: "",
      note_plan_traffic_type: 0,
    },
  });

  useEffect(() => {
    if (open && initialVps) {
        // Pre-fill form with existing VPS data when dialog opens and VPS data is available
        form.reset({
            id: initialVps.id,
            name: initialVps.name || "",
            type: initialVps.type || "",
            group_name: initialVps.group_name || "",
            country_region: initialVps.country_region || "",
            note_billing_start_date: initialVps.note_billing_start_date || "",
            note_billing_end_date: initialVps.note_billing_end_date || "",
            note_billing_cycle: initialVps.note_billing_cycle || "",
            note_billing_amount: initialVps.note_billing_amount || "",
            note_plan_bandwidth: initialVps.note_plan_bandwidth || "",
            note_plan_traffic_type: initialVps.note_plan_traffic_type === null ? undefined : initialVps.note_plan_traffic_type,
        });
    } else if (!open) {
        form.reset(); // Reset form when dialog closes
    }
  }, [open, initialVps, form]);


  const onSubmit = async (data: EditVpsInstanceInput) => {
    if (!initialVps) return;
    setIsSubmitting(true);
    try {
      // Ensure ID is part of the data sent to the server action
      const result = await updateVpsInstance({ ...data, id: initialVps.id }); 
      if (result.success) {
        toast({ title: "Success", description: "VPS instance updated successfully." });
        onOpenChange(false);
        if (onSuccess) onSuccess();
      } else {
        toast({ title: "Error", description: result.error || "Failed to update VPS instance.", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "An unexpected error occurred.", variant: "destructive" });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!initialVps && open) { // Show loading or error if VPS data isn't available when dialog is open
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Loading VPS Data...</DialogTitle>
                </DialogHeader>
                <div className="flex justify-center items-center py-10">
                    <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
                </div>
            </DialogContent>
        </Dialog>
    );
  }


  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center">
            <FilePenLineIcon className="mr-2 h-6 w-6" /> Edit Server (ID: {initialVps?.id})
          </DialogTitle>
          <DialogDescription>
            Modify the details for this VPS instance. IP address is reported by the agent and not directly editable here.
          </DialogDescription>
        </DialogHeader>
        {isLoadingVps ? (
            <div className="flex justify-center items-center py-10">
                <Loader2Icon className="h-8 w-8 animate-spin text-primary" />
            </div>
        ) : (
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 py-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-destructive">*</span></Label>
              <Input id="name" {...form.register("name")} />
              {form.formState.errors.name && <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Type</Label>
              <Input id="type" {...form.register("type")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="group_name">Group</Label>
              <Input id="group_name" {...form.register("group_name")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="country_region">Country/Region</Label>
              <Input id="country_region" {...form.register("country_region")} />
            </div>
          </div>

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
              <Input id="note_billing_cycle" {...form.register("note_billing_cycle")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note_billing_amount">Amount</Label>
              <Input id="note_billing_amount" {...form.register("note_billing_amount")} />
            </div>
          </div>

          <h3 className="text-lg font-medium pt-4 border-t mt-4">Plan Data (Note)</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="note_plan_bandwidth">Bandwidth</Label>
              <Input id="note_plan_bandwidth" {...form.register("note_plan_bandwidth")} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="note_plan_traffic_type">Traffic Type</Label>
              <Select
                onValueChange={(value) => form.setValue("note_plan_traffic_type", parseInt(value))}
                value={form.watch("note_plan_traffic_type")?.toString()} // Ensure value is watched for dynamic updates
                defaultValue={initialVps?.note_plan_traffic_type?.toString() || "0"}
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
                <Button type="button" variant="outline" onClick={() => { form.reset(); onOpenChange(false); }}>Cancel</Button>
            </DialogClose>
            <Button type="submit" disabled={isSubmitting || isLoadingVps}>
              {isSubmitting ? <Loader2Icon className="mr-2 h-4 w-4 animate-spin" /> : null}
              {isSubmitting ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </form>
        )}
      </DialogContent>
    </Dialog>
  );
}

