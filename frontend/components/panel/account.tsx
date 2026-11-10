"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { LogOut, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { NewPasswordForm } from "@/components/auth/auth-forms";
import { useSignOut } from "@/components/panel/panel-header";
import { PageHeading } from "@/components/site-chrome";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { api, queryKeys } from "@/lib/api";
import { HESAP } from "@/lib/metinler";

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>
          <h2 className="text-lg">{title}</h2>
        </CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

export function Account({ profile }: { profile: React.ReactNode }) {
  const queryClient = useQueryClient();
  const signOut = useSignOut();

  const deleteAll = useMutation({
    mutationFn: api.deleteAllPredictions,
    onSuccess: ({ deleted }) => {
      toast.success(HESAP.veri.basarili(deleted));
      queryClient.removeQueries({ queryKey: queryKeys.predictions });
    },
    onError: (error) => toast.error(error.message),
  });

  return (
    <div className="max-w-2xl">
      <PageHeading title={HESAP.baslik} />

      <div className="mt-8 space-y-6">
        <Section title={HESAP.profil.baslik}>
          {profile}
        </Section>

        <Section title={HESAP.sifre.baslik} description={HESAP.sifre.aciklama}>
          <NewPasswordForm
            submitLabel={HESAP.sifre.dugme}
            pendingLabel={HESAP.sifre.bekle}
            successMessage={HESAP.sifre.basarili}
          />
        </Section>

        <Section title={HESAP.veri.baslik} description={HESAP.veri.aciklama}>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive" disabled={deleteAll.isPending}>
                <Trash2 aria-hidden />
                {HESAP.veri.dugme}
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>{HESAP.veri.onayBaslik}</AlertDialogTitle>
                <AlertDialogDescription>{HESAP.veri.onayAciklama}</AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>{HESAP.veri.vazgec}</AlertDialogCancel>
                <AlertDialogAction variant="destructive" onClick={() => deleteAll.mutate()}>
                  {HESAP.veri.onay}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </Section>

        <Section title={HESAP.cikis.baslik}>
          <Button variant="outline" onClick={signOut}>
            <LogOut aria-hidden />
            {HESAP.cikis.dugme}
          </Button>
        </Section>
      </div>
    </div>
  );
}
