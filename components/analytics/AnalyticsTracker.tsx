"use client";

import { useEffect, useRef } from "react";
import { trackPageView } from "@/app/actions/tracking-actions";

interface AnalyticsTrackerProps {
  funnelId: string;
  stepId?: string; // Optional: If you want to track specific steps (Landing vs Checkout)
}

export default function AnalyticsTracker({ funnelId, stepId }: AnalyticsTrackerProps) {
  // Use a ref to ensure we only fire once per page load (Strict Mode safety)
  const hasFired = useRef(false);

  useEffect(() => {
    if (hasFired.current) return;
    hasFired.current = true;

    const track = async () => {
      // Capture where they came from (e.g., Google, Twitter)
      const referrer = document.referrer || "";
      
      try {
        await trackPageView({
          funnelId,
          funnelStepId: stepId,
          referrer,
        });
        console.log("📊 Analytics: View tracked");
      } catch (err) {
        // Fail silently in production so we don't annoy users
        if (process.env.NODE_ENV === 'development') {
          console.error("Analytics Error:", err);
        }
      }
    };

    track();
  }, [funnelId, stepId]);

  // This component renders nothing visually
  return null;
}