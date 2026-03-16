import { RiskEngineAgent, VitalInput } from '../engines/risk_engine';

describe('RiskEngineAgent', () => {
    it('should classify a normal user as Stable', () => {
        const vitals: VitalInput = {
            heart_rate: 70,
            blood_pressure: { systolic: 120, diastolic: 80 },
            temperature: 36.6,
            spo2: 98,
            respiratory_rate: 16
        };

        const result = RiskEngineAgent.evaluate(vitals);

        expect(result.classification).toBe('Stable');
        expect(result.risk_score).toBe(0);
        expect(result.triggered_rules.length).toBe(0);
        expect(result.explanation_summary).toContain('Stable');
    });

    it('should classify a user with elevated vitals as Monitor', () => {
        const vitals: VitalInput = {
            heart_rate: 95, // Elevated (weight 15)
            blood_pressure: { systolic: 145, diastolic: 85 }, // Sys elevated (weight 15)
            temperature: 37.5,
            spo2: 96,
            respiratory_rate: 18,
            historical_trend: 10 // Trend (weight 10)
        };

        // Expected score: 15 (HR) + 15 (BP Sys) + 10 (Trend) = 40

        const result = RiskEngineAgent.evaluate(vitals);

        expect(result.classification).toBe('Monitor');
        expect(result.risk_score).toBe(40);
        expect(result.triggered_rules.length).toBe(3);
        expect(result.explanation_summary).toContain('High Heart Rate');
        expect(result.explanation_summary).toContain('High Systolic BP');
    });

    it('should classify a user with extreme vitals as Critical', () => {
        const vitals: VitalInput = {
            heart_rate: 140, // Severe high (weight 30)
            blood_pressure: { systolic: 90, diastolic: 60 }, // Severe low sys (weight 30)
            temperature: 39.5, // Severe high temp (weight 20)
            spo2: 90, // Severe low spo2 (weight 40)
            respiratory_rate: 28 // Severe high rr (weight 20)
        };

        // Expected score: 30 + 30 + 20 + 40 + 20 = 140 (clamped to 100)

        const result = RiskEngineAgent.evaluate(vitals);

        expect(result.classification).toBe('Critical');
        expect(result.risk_score).toBe(100);
        expect(result.triggered_rules.length).toBe(5);
        expect(result.explanation_summary).toContain('Critically High Heart Rate');
    });
});
