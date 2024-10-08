"use client";

import { CreateOrganization, useOrganization } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Onboarding() {
  const { organization } = useOrganization();
  const router = useRouter();

  useEffect(() => {
    if (organization) {
      router.push(`/organization/${organization.id}`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization]);

  return (
    <div className="flex justify-center items-center pt-20">
      <CreateOrganization afterCreateOrganizationUrl="/organization/:id" />
    </div>
  );
}
