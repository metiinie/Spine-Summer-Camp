import { notFound } from "next/navigation";
import { PaymentClient } from "@/components/payment/PaymentClient";

interface PaymentPageProps {
  params: { locale: string; registrationId: string };
}

export default async function PaymentPage({ params: { registrationId } }: PaymentPageProps) {
  const backendUrl = process.env.BACKEND_URL || "http://localhost:4000";
  const res = await fetch(`${backendUrl}/registrations/payment/${registrationId}`, {
    cache: 'no-store'
  });
  
  if (!res.ok) notFound();
  
  const registration = await res.json();

  if (!registration) notFound();

  return (
    <PaymentClient
      registration={{
        id: registration.id,
        referenceNumber: registration.referenceNumber,
        amount: registration.amount.toString(),
        session: registration.session,
        status: registration.status,
        receiptUrl: registration.receiptUrl,
        camper: registration.camper
          ? { firstName: registration.camper.firstName, lastName: registration.camper.lastName }
          : null,
      }}
    />
  );
}
