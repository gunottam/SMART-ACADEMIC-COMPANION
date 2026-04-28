"use client";

import { useState, useTransition } from "react";
import { useSession } from "next-auth/react";
import { updateProfile } from "@/actions/profile";
import { toast } from "@/components/ui/Toaster";
import { Button } from "@/components/ui/Button";
import { Card, CardBody, CardDescription, CardHeader, CardTitle } from "@/components/ui/Card";
import { Input, Label } from "@/components/ui/Input";
import { initials } from "@/lib/utils";

export default function TeacherSettingsPage() {
  const { data: session } = useSession();
  const [name, setName] = useState(session?.user?.name || "");
  const [isPending, startTransition] = useTransition();

  const onSave = () => {
    startTransition(async () => {
      const res = await updateProfile({ name });
      if (res.success) toast.success("Profile updated.");
      else toast.error(res.error || "Failed to update profile.");
    });
  };

  return (
    <div className="px-4 sm:px-6 md:px-8 py-8 max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-blue-600 tracking-tight mb-2">
          Instructor Settings
        </h1>
        <p className="text-sm text-slate-600">
          Manage instructor profile details.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Profile</CardTitle>
          <CardDescription>
            Keep your instructor identity up to date for students.
          </CardDescription>
        </CardHeader>
        <CardBody className="space-y-6">
          <div className="flex items-center gap-4">
            <div className="h-14 w-14 rounded-full bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-700 font-semibold">
              {initials(session?.user?.name)}
            </div>
            <div>
              <p className="text-sm font-medium text-slate-900">
                {session?.user?.name || "Instructor"}
              </p>
              <p className="text-xs text-slate-500">{session?.user?.email || ""}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="teacher-name">Full name</Label>
              <Input
                id="teacher-name"
                value={name || session?.user?.name || ""}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
            <div>
              <Label htmlFor="teacher-email">Email</Label>
              <Input id="teacher-email" value={session?.user?.email || ""} disabled />
            </div>
          </div>

          <div className="flex justify-end">
            <Button variant="secondary" onClick={onSave} loading={isPending}>
              Save changes
            </Button>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
