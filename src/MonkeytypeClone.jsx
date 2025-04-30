import { useState, useEffect, useRef } from 'react';
import { Clock, RotateCcw, Award } from 'lucide-react';

export default function MonkeytypeClone() {
  const [text, setText] = useState('');
  const [userInput, setUserInput] = useState('');
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [errors, setErrors] = useState(0);
  const [timerMode, setTimerMode] = useState('30'); // Timer modes: 15, 30, 60 seconds
  const [timeLeft, setTimeLeft] = useState(parseInt(timerMode));
  const [isActive, setIsActive] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [accuracy, setAccuracy] = useState(100);
  const [theme, setTheme] = useState('dark'); // dark, light, sepia
  const [completedTests, setCompletedTests] = useState([]);
  
  const inputRef = useRef(null);
  const wordRef = useRef(null);
  
  const sampleTexts = [
    "The quick brown fox jumps over the lazy dog. Sphinx of black quartz, judge my vow. How vexingly quick daft zebras jump!",
    "Programming is the process of creating a set of instructions that tell a computer how to perform a task. Programming can be done using many different languages.",
    "The five boxing wizards jump quickly. Pack my box with five dozen liquor jugs. Amazingly few discotheques provide jukeboxes.",
    "She sells seashells by the seashore. The shells she sells are surely seashells. So if she sells shells on the seashore, I'm sure she sells seashore shells.",
    "The rain in Spain stays mainly in the plain. How much wood would a woodchuck chuck if a woodchuck could chuck wood?"
  ];

  useEffect(() => {
    // Pick a random text when component mounts
    const randomIndex = Math.floor(Math.random() * sampleTexts.length);
    setText(sampleTexts[randomIndex]);
    
    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  }, []);

  useEffect(() => {
    let interval = null;
    
    if (isActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prevTime => {
          if (prevTime <= 1) {
            finishTest();
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    }
    
    return () => clearInterval(interval);
  }, [isActive, timeLeft]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    
    if (!isActive && value.length === 1) {
      // Start timer when user begins typing
      setStartTime(Date.now());
      setIsActive(true);
      setTimeLeft(parseInt(timerMode));
    }
    
    // Check for errors
    if (value.length > 0 && value[value.length - 1] !== text[value.length - 1]) {
      setErrors(errors + 1);
    }
    
    // Update position in text
    setCurrentIndex(value.length);
    
    // Calculate accuracy
    const totalCharacters = value.length;
    const accuracyPercentage = totalCharacters > 0 
      ? Math.max(0, 100 - (errors / totalCharacters * 100)) 
      : 100;
    setAccuracy(Math.round(accuracyPercentage));
    
    // Update user input
    setUserInput(value);
    
    // Count completed words
    const words = value.trim().split(/\s+/);
    setWordCount(value.trim().endsWith(' ') ? words.length : words.length - 1);
    
    // Check if completed
    if (value === text) {
      finishTest();
    }
  };

  const finishTest = () => {
    setEndTime(Date.now());
    setIsActive(false);
    
    // Calculate WPM and save results
    const minutes = (Date.now() - startTime) / 60000;
    const wpm = Math.round(wordCount / minutes);
    
    setCompletedTests([
      ...completedTests, 
      { wpm, accuracy, timeSpent: parseInt(timerMode) - timeLeft }
    ]);
  };

  const resetTest = () => {
    const randomIndex = Math.floor(Math.random() * sampleTexts.length);
    setText(sampleTexts[randomIndex]);
    setUserInput('');
    setStartTime(null);
    setEndTime(null);
    setCurrentIndex(0);
    setErrors(0);
    setIsActive(false);
    setTimeLeft(parseInt(timerMode));
    setWordCount(0);
    setAccuracy(100);
    
    // Focus the input field
    if (inputRef.current) {
      inputRef.current.focus();
    }
  };

  const changeTimerMode = (newMode) => {
    setTimerMode(newMode);
    setTimeLeft(parseInt(newMode));
    resetTest();
  };

  const changeTheme = (newTheme) => {
    setTheme(newTheme);
  };

  const renderText = () => {
    return text.split('').map((char, index) => {
      let className = '';
      
      if (index < currentIndex) {
        className = userInput[index] === char ? 'text-green-500' : 'text-red-500';
      } else if (index === currentIndex) {
        className = 'bg-gray-400 bg-opacity-40';
      }
      
      return (
        <span key={index} className={className}>
          {char}
        </span>
      );
    });
  };
  
  const calculateWPM = () => {
    if (!startTime || !isActive) return 0;
    
    const minutes = (Date.now() - startTime) / 60000;
    return Math.round(wordCount / minutes) || 0;
  };

  // Generate theme classes
  const themeClasses = {
    container: {
      dark: 'bg-gray-900 text-gray-100',
      light: 'bg-gray-100 text-gray-900',
      sepia: 'bg-amber-100 text-amber-900'
    },
    card: {
      dark: 'bg-gray-800',
      light: 'bg-white',
      sepia: 'bg-amber-50'
    },
    button: {
      dark: 'bg-gray-700 hover:bg-gray-600',
      light: 'bg-gray-200 hover:bg-gray-300',
      sepia: 'bg-amber-200 hover:bg-amber-300'
    },
    buttonActive: {
      dark: 'bg-blue-600 text-white',
      light: 'bg-blue-500 text-white',
      sepia: 'bg-amber-600 text-white'
    },
    input: {
      dark: 'bg-gray-700 text-gray-100',
      light: 'bg-gray-200 text-gray-900',
      sepia: 'bg-amber-200 text-amber-900'
    }
  };

  return (
    <div className={`min-h-screen p-4 md:p-8 transition-colors duration-300 ${themeClasses.container[theme]}`}>
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold">MonkeyType Clone</h1>
          
          <div className="flex space-x-2">
            <button 
              onClick={() => changeTheme('dark')} 
              className={`px-3 py-1 rounded text-sm ${theme === 'dark' ? themeClasses.buttonActive[theme] : themeClasses.button[theme]}`}
            >
              Dark
            </button>
            <button 
              onClick={() => changeTheme('light')} 
              className={`px-3 py-1 rounded text-sm ${theme === 'light' ? themeClasses.buttonActive[theme] : themeClasses.button[theme]}`}
            >
              Light
            </button>
            <button 
              onClick={() => changeTheme('sepia')} 
              className={`px-3 py-1 rounded text-sm ${theme === 'sepia' ? themeClasses.buttonActive[theme] : themeClasses.button[theme]}`}
            >
              Sepia
            </button>
          </div>
        </header>

        {/* Timer options */}
        <div className="mb-6 flex justify-center space-x-4">
          <button 
            onClick={() => changeTimerMode('15')} 
            className={`flex items-center px-4 py-2 rounded ${timerMode === '15' ? themeClasses.buttonActive[theme] : themeClasses.button[theme]}`}
          >
            <Clock className="w-4 h-4 mr-2" /> 15s
          </button>
          <button 
            onClick={() => changeTimerMode('30')} 
            className={`flex items-center px-4 py-2 rounded ${timerMode === '30' ? themeClasses.buttonActive[theme] : themeClasses.button[theme]}`}
          >
            <Clock className="w-4 h-4 mr-2" /> 30s
          </button>
          <button 
            onClick={() => changeTimerMode('60')} 
            className={`flex items-center px-4 py-2 rounded ${timerMode === '60' ? themeClasses.buttonActive[theme] : themeClasses.button[theme]}`}
          >
            <Clock className="w-4 h-4 mr-2" /> 60s
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className={`${themeClasses.card[theme]} p-4 rounded shadow-lg text-center`}>
            <div className="text-sm opacity-70">WPM</div>
            <div className="text-2xl font-bold">{calculateWPM()}</div>
          </div>
          <div className={`${themeClasses.card[theme]} p-4 rounded shadow-lg text-center`}>
            <div className="text-sm opacity-70">Accuracy</div>
            <div className="text-2xl font-bold">{accuracy}%</div>
          </div>
          <div className={`${themeClasses.card[theme]} p-4 rounded shadow-lg text-center`}>
            <div className="text-sm opacity-70">Time</div>
            <div className="text-2xl font-bold">{timeLeft}s</div>
          </div>
        </div>

        {/* Typing area */}
        <div className={`${themeClasses.card[theme]} p-6 rounded-lg shadow-lg mb-6`}>
          {/* Text to type */}
          <div 
            ref={wordRef}
            className="text-lg md:text-xl mb-6 leading-relaxed font-mono min-h-24"
          >
            {renderText()}
          </div>
          
          {/* Input field */}
          {!endTime && timeLeft > 0 ? (
            <input
              ref={inputRef}
              type="text"
              value={userInput}
              onChange={handleInputChange}
              className={`w-full p-3 rounded ${themeClasses.input[theme]} font-mono focus:outline-none focus:ring-2 focus:ring-blue-500`}
              placeholder="Start typing..."
              autoComplete="off"
              autoCorrect="off"
              spellCheck="false"
            />
          ) : (
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Test Complete!</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="p-3 bg-opacity-20 bg-blue-500 rounded">
                  <div className="text-sm opacity-70">WPM</div>
                  <div className="text-2xl font-bold">
                    {completedTests.length > 0 ? completedTests[completedTests.length - 1].wpm : 0}
                  </div>
                </div>
                <div className="p-3 bg-opacity-20 bg-green-500 rounded">
                  <div className="text-sm opacity-70">Accuracy</div>
                  <div className="text-2xl font-bold">
                    {completedTests.length > 0 ? completedTests[completedTests.length - 1].accuracy : 0}%
                  </div>
                </div>
                <div className="p-3 bg-opacity-20 bg-purple-500 rounded">
                  <div className="text-sm opacity-70">Time Spent</div>
                  <div className="text-2xl font-bold">
                    {completedTests.length > 0 ? completedTests[completedTests.length - 1].timeSpent : 0}s
                  </div>
                </div>
              </div>
              <button 
                onClick={resetTest} 
                className={`flex items-center mx-auto px-6 py-2 rounded ${themeClasses.buttonActive[theme]}`}
              >
                <RotateCcw className="w-4 h-4 mr-2" /> Try Again
              </button>
            </div>
          )}
        </div>

        {/* History */}
        {completedTests.length > 0 && (
          <div className={`${themeClasses.card[theme]} p-6 rounded-lg shadow-lg`}>
            <h2 className="text-xl font-bold mb-4 flex items-center">
              <Award className="w-5 h-5 mr-2" /> Test History
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-opacity-20">
                    <th className="py-2 text-left">Test #</th>
                    <th className="py-2 text-left">WPM</th>
                    <th className="py-2 text-left">Accuracy</th>
                    <th className="py-2 text-left">Time (s)</th>
                  </tr>
                </thead>
                <tbody>
                  {completedTests.map((test, index) => (
                    <tr key={index} className="border-b border-opacity-10">
                      <td className="py-2">{index + 1}</td>
                      <td className="py-2">{test.wpm}</td>
                      <td className="py-2">{test.accuracy}%</td>
                      <td className="py-2">{test.timeSpent}s</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}