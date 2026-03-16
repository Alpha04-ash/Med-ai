import { logEvent } from '../utils/logger';

export interface VitalInput {
    heart_rate: number;
    blood_pressure: {
        systolic: number;
        diastolic: number;
    };
    temperature: number;
    spo2: number;
    respiratory_rate: number;
    historical_trend?: number; // Optional trend impact score
}

export interface RuleOutcome {
    rule_id: string;
    description: string;
    weight: number;
}

export interface RiskEngineResult {
    risk_score: number;
    classification: 'Stable' | 'Monitor' | 'Critical';
    triggered_rules: RuleOutcome[];
    explanation_summary: string;
}

export class RiskEngineAgent {
    // Configurable thresholds and weights based on standard Early Warning Scores
    static CONFIG = {
        hr: { min: 50, max: 90, weight: 15, severeMin: 40, severeMax: 130, severeWeight: 30 },
        sysBP: { min: 100, max: 140, weight: 15, severeMin: 90, severeMax: 200, severeWeight: 30 },
        diaBP: { min: 60, max: 90, weight: 10, severeMin: 50, severeMax: 110, severeWeight: 20 },
        temp: { min: 36.1, max: 38.0, weight: 10, severeMin: 35.0, severeMax: 39.1, severeWeight: 20 },
        spo2: { min: 95, weight: 20, severeMin: 91, severeWeight: 40 },
        rr: { min: 12, max: 20, weight: 10, severeMin: 8, severeMax: 25, severeWeight: 20 },
    };

    static evaluate(vitals: VitalInput): RiskEngineResult {
        let risk_score = 0;
        const triggered_rules: RuleOutcome[] = [];

        const check = (
            name: string,
            val: number,
            conf: any,
            prefix: string,
            unit: string
        ) => {
            // Check severe thresholds first
            if ((conf.severeMin && val <= conf.severeMin) || (conf.severeMax && val >= conf.severeMax)) {
                risk_score += conf.severeWeight;
                const condition = val <= conf.severeMin ? 'Critically Low' : 'Critically High';
                triggered_rules.push({
                    rule_id: `${prefix}_SEVERE`,
                    description: `${condition} ${name} (${val} ${unit})`,
                    weight: conf.severeWeight,
                });
            }
            // Check abnormal (warning) thresholds
            else if (val < conf.min || (conf.max && val > conf.max)) {
                risk_score += conf.weight;
                const condition = val < conf.min ? 'Low' : 'High';
                triggered_rules.push({
                    rule_id: `${prefix}_ABNORMAL`,
                    description: `${condition} ${name} (${val} ${unit})`,
                    weight: conf.weight,
                });
            }
        };

        check('Heart Rate', vitals.heart_rate, this.CONFIG.hr, 'HR', 'bpm');
        check('Systolic BP', vitals.blood_pressure.systolic, this.CONFIG.sysBP, 'BP_SYS', 'mmHg');
        check('Diastolic BP', vitals.blood_pressure.diastolic, this.CONFIG.diaBP, 'BP_DIA', 'mmHg');
        check('Temperature', vitals.temperature, this.CONFIG.temp, 'TEMP', '°C');

        // SpO2 logic (only min applies)
        if (vitals.spo2 <= this.CONFIG.spo2.severeMin) {
            risk_score += this.CONFIG.spo2.severeWeight;
            triggered_rules.push({
                rule_id: 'SPO2_SEVERE',
                description: `Critically Low SpO2 (${vitals.spo2}%)`,
                weight: this.CONFIG.spo2.severeWeight,
            });
        } else if (vitals.spo2 < this.CONFIG.spo2.min) {
            risk_score += this.CONFIG.spo2.weight;
            triggered_rules.push({
                rule_id: 'SPO2_ABNORMAL',
                description: `Low SpO2 (${vitals.spo2}%)`,
                weight: this.CONFIG.spo2.weight,
            });
        }

        check('Respiratory Rate', vitals.respiratory_rate, this.CONFIG.rr, 'RR', 'bpm');

        // Interpret historical trend impact
        if (vitals.historical_trend) {
            risk_score += vitals.historical_trend;
            if (vitals.historical_trend > 0) {
                triggered_rules.push({
                    rule_id: 'HISTORICAL_TREND_WORSENING',
                    description: `Worsening historical trend (+${vitals.historical_trend} pts)`,
                    weight: vitals.historical_trend,
                });
            }
        }

        // Clamp score
        risk_score = Math.min(Math.max(risk_score, 0), 100);

        let classification: 'Stable' | 'Monitor' | 'Critical' = 'Stable';
        if (risk_score >= 70) {
            classification = 'Critical';
        } else if (risk_score >= 40) {
            classification = 'Monitor';
        }

        const explanation_summary = triggered_rules.length > 0
            ? `Patient categorized as ${classification} due to: ${triggered_rules.map(r => r.description).join(', ')}.`
            : `Patient vitals are within normal limits. Categorized as Stable.`;

        logEvent('RiskEngineAgent', `Evaluated vitals: ${classification} (Score: ${risk_score})`, {
            risk_score,
            rules: triggered_rules.map(r => r.rule_id)
        });

        return {
            risk_score,
            classification,
            triggered_rules,
            explanation_summary
        };
    }
}
