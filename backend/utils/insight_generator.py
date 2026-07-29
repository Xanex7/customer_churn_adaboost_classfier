def generate_insights(data, prediction, probability):
    churn_risk = probability[1] if len(probability) > 1 else probability[0]
    is_churn = int(prediction) == 1

    drivers = []
    actions = []

    if float(data.get("Support Calls", 0)) >= 4:
        drivers.append("High support call volume indicates unresolved dissatisfaction.")
        actions.append("Assign Senior CS Representative for a direct outreach call.")

    if float(data.get("Payment Delay", 0)) >= 10:
        drivers.append("Severe payment delay signals financial friction or disengagement.")
        actions.append("Offer a 15% Retention Discount or flexible billing cycle.")

    if float(data.get("Usage Frequency", 0)) <= 5:
        drivers.append("Low product usage frequency shows declining engagement.")
        actions.append("Trigger re-engagement campaign with product feature walkthroughs.")

    if str(data.get("Contract Length")) == "Monthly":
        drivers.append("Monthly contract structure provides low switching barriers.")
        actions.append("Propose an incentivized Annual Contract upgrade with 2 months free.")

    if not drivers:
        if is_churn:
            drivers.append("Overall feature combination indicates marginal churn risk.")
            actions.append("Schedule a preemptive customer health check-in.")
        else:
            drivers.append("Strong engagement metrics, minimal support friction, and timely payments.")
            actions.append("No critical intervention required; target for loyalty program upsell.")

    if churn_risk > 0.75:
        segment = "Critical Hazard (Immediate Churn Risk)"
        rec = "Retention Discount + High-Priority Support Call"
    elif churn_risk > 0.45:
        segment = "At-Risk Customer"
        rec = "Offer Special Upgrade Coupon & Account Review"
    else:
        segment = "Loyal Customer"
        rec = "No Intervention Needed / Premium Upsell Candidate"

    return {
        "risk_level": "High" if churn_risk > 0.6 else ("Medium" if churn_risk > 0.35 else "Low"),
        "customer_segment": segment,
        "key_drivers": drivers,
        "recommended_action": rec,
        "action_items": actions
    }
