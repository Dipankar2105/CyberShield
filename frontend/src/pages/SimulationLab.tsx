import { useState, useEffect } from 'react';
import { Shield, MessageSquare, AlertTriangle, CheckCircle, RefreshCw, Info, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { generateScenario } from '../services/api';

interface ScenarioOption {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation: string;
}

interface Scenario {
  id: number;
  type: string;
  platform: string;
  sender: string;
  message: string;
  options: ScenarioOption[];
}

export default function SimulationLab() {
  const [scenario, setScenario] = useState<Scenario | null>(null);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const loadNewScenario = async () => {
    setIsLoading(true);
    setSelectedOption(null);
    setShowExplanation(false);
    try {
      const data = await generateScenario();
      setScenario(data);
    } catch (err) {
      console.error('Failed to load scenario:', err);
      // Fallback scenario
      setScenario({
        id: Date.now(),
        type: 'Digital Arrest',
        platform: 'WhatsApp',
        sender: '+91 98765 43210 (CBI Officer)',
        message: "URGENT: This is CBI calling. Your Aadhaar is linked to money laundering. Digital arrest warrant issued. Transfer ₹75,000 immediately to avoid arrest.",
        options: [
          { id: 'a', text: 'Transfer the money immediately.', isCorrect: false, explanation: 'Never pay under threats. CBI never demands money via phone.' },
          { id: 'b', text: 'Ask for official documentation.', isCorrect: false, explanation: 'Scammers have fake documents. Do not engage.' },
          { id: 'c', text: 'Hang up and report to cybercrime.gov.in.', isCorrect: true, explanation: 'Correct! This is a scam. Real police never demand money.' }
        ]
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadNewScenario();
  }, []);

  const handleOptionSelect = (optionId: string) => {
    if (selectedOption) return;
    setSelectedOption(optionId);
    setShowExplanation(true);
  };

  const handleNextScenario = () => {
    loadNewScenario();
  };

  if (isLoading || !scenario) {
    return (
      <div className="max-w-4xl mx-auto flex items-center justify-center min-h-[500px]">
        <div className="text-center">
          <Loader2 className="w-12 h-12 text-cyan-400 animate-spin mx-auto mb-4" />
          <p className="text-slate-400">Generating new scenario...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 mb-2">Scam Simulation Lab</h1>
          <p className="text-slate-400">Train your instincts by interacting with simulated scam scenarios.</p>
        </div>
        <div className="flex items-center space-x-2 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-xl">
          <span className="text-sm text-slate-400">Type:</span>
          <span className="font-medium text-cyan-400">{scenario.type}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Phone Mockup */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-3xl p-4 backdrop-blur-sm flex flex-col items-center justify-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-32 h-6 bg-slate-950 rounded-b-xl z-20"></div>
          <div className="w-full max-w-[320px] bg-slate-950 rounded-[2rem] border-4 border-slate-800 h-[600px] relative overflow-hidden flex flex-col shadow-inner">
            {/* Phone Header */}
            <div className="bg-slate-900 px-4 pt-8 pb-3 flex items-center border-b border-slate-800 z-10">
              <div className="w-10 h-10 rounded-full bg-slate-800 flex items-center justify-center mr-3">
                <Shield className="w-5 h-5 text-slate-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-slate-200">{scenario.sender}</p>
                <p className="text-xs text-slate-500">{scenario.platform}</p>
              </div>
            </div>

            {/* Phone Body */}
            <div className="flex-1 bg-slate-950 p-4 overflow-y-auto flex flex-col justify-end">
              <motion.div
                key={scenario.id}
                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                className="bg-slate-800 rounded-2xl rounded-tl-sm p-4 text-sm text-slate-200 shadow-md max-w-[85%] self-start"
              >
                {scenario.message}
              </motion.div>
              <div className="text-xs text-slate-500 mt-2 ml-1">10:42 AM</div>
            </div>

            {/* Phone Footer */}
            <div className="bg-slate-900 p-3 border-t border-slate-800 flex items-center">
              <div className="flex-1 bg-slate-950 rounded-full h-10 border border-slate-800 px-4 flex items-center text-slate-500 text-sm">
                Type a message...
              </div>
              <div className="w-10 h-10 rounded-full bg-cyan-500 ml-2 flex items-center justify-center">
                <SendIcon className="w-4 h-4 text-slate-950 ml-1" />
              </div>
            </div>
          </div>
        </div>

        {/* Interaction Area */}
        <div className="flex flex-col space-y-6">
          <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <h3 className="text-lg font-semibold text-slate-200 mb-4 flex items-center">
              <MessageSquare className="w-5 h-5 mr-2 text-cyan-400" />
              How would you respond?
            </h3>
            
            <div className="space-y-3">
              {scenario.options.map((option) => {
                const isSelected = selectedOption === option.id;
                const showResult = selectedOption !== null;
                
                let buttonClass = "w-full text-left p-4 rounded-xl border transition-all duration-200 ";
                
                if (!showResult) {
                  buttonClass += "bg-slate-950 border-slate-800 hover:border-cyan-500/50 hover:bg-slate-800 text-slate-300";
                } else if (isSelected && option.isCorrect) {
                  buttonClass += "bg-emerald-900/20 border-emerald-500/50 text-emerald-400";
                } else if (isSelected && !option.isCorrect) {
                  buttonClass += "bg-red-900/20 border-red-500/50 text-red-400";
                } else if (!isSelected && option.isCorrect) {
                  buttonClass += "bg-emerald-900/10 border-emerald-500/30 text-emerald-400/70";
                } else {
                  buttonClass += "bg-slate-950 border-slate-800 text-slate-500 opacity-50";
                }

                return (
                  <button
                    key={option.id}
                    onClick={() => handleOptionSelect(option.id)}
                    disabled={showResult}
                    className={buttonClass}
                  >
                    <div className="flex items-start">
                      <div className="w-6 h-6 rounded-full border border-current flex items-center justify-center mr-3 shrink-0 mt-0.5">
                        {showResult && option.isCorrect && <CheckCircle className="w-4 h-4" />}
                        {showResult && isSelected && !option.isCorrect && <AlertTriangle className="w-4 h-4" />}
                        {!showResult && <span className="text-xs">{option.id.toUpperCase()}</span>}
                      </div>
                      <span className="text-sm font-medium">{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          <AnimatePresence>
            {showExplanation && (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-slate-900/50 border rounded-2xl p-6 backdrop-blur-sm ${
                  scenario.options.find(o => o.id === selectedOption)?.isCorrect
                    ? 'border-emerald-500/30'
                    : 'border-red-500/30'
                }`}
              >
                <h4 className="text-sm font-medium text-slate-400 uppercase tracking-wider mb-3 flex items-center">
                  <Info className="w-4 h-4 mr-2" />
                  Analysis
                </h4>
                <p className="text-slate-300 text-sm leading-relaxed mb-6">
                  {scenario.options.find(o => o.id === selectedOption)?.explanation}
                </p>
                
                <button
                  onClick={handleNextScenario}
                  className="w-full flex items-center justify-center px-4 py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-semibold rounded-xl transition-colors shadow-[0_0_15px_rgba(6,182,212,0.3)]"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Generate New Scenario
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

function SendIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="m22 2-7 20-4-9-9-4Z" />
      <path d="M22 2 11 13" />
    </svg>
  );
}
