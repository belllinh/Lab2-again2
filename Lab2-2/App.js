import React, { useState, useRef, useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, Appearance, Animated, KeyboardAvoidingView, Platform,  ScrollView } from 'react-native';

import Feather from '@expo/vector-icons/Feather';
import * as math from 'mathjs';

export default function App() {
  const [currentInput, setCurrentInput] = useState('');
  const [result, setResult] = useState('');
  const [showScientific, setShowScientific] = useState(false);
  const [isRadians, setIsRadians] = useState(false);   
  const [isDarkMode, setIsDarkMode] = useState(Appearance.getColorScheme() === 'dark');
  const [isInverse, setIsInverse] = useState(false);
  const [history, setHistory] = useState([]);
  const [showHistory, setShowHistory] = useState(false);
  const fadeAnim = useRef(new Animated.Value(1)).current;


  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      setIsDarkMode(colorScheme === 'dark');
    });
    return () => subscription.remove();
  }, []);
  const toggleDarkMode = () => {
    Animated.timing(fadeAnim, {
      toValue: 800,
      duration: 1000,
      useNativeDriver: true,
    }).start(() => {
      setIsDarkMode(!isDarkMode);
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }).start();
    });
  };

  const getThemeColors = () => ({
    backgroundColor: isDarkMode ? '#16161a' : '#fff',
    textColor: isDarkMode ? '#fff' : '#000',
    buttonColor: isDarkMode ? '#333' : '#f0f0f0',
    scientificBgColor: isDarkMode ? '#2cb67d' : '#232946',
    displayBgColor: isDarkMode ? '#1e1e1e' : '#f8f5f2',
    equalButtonColor: '#33cbcc',
  });

  const theme = getThemeColors();

  const dynamicStyles = {
    container: {
      backgroundColor: theme.backgroundColor,
    },
    display: {
      backgroundColor: theme.displayBgColor,
    },
    inputText: {
      color: theme.textColor,
    },
    resultText: {
      color: theme.textColor,
    },
    scientificButtons: {
      backgroundColor: theme.scientificBgColor,
    },
    St_button: {
      backgroundColor: theme.buttonColor,
    },
    buttonText: {
      color: theme.textColor,
    },
    toggleButton: {
      color: theme.textColor,
    },
    operatorButtonText: {
      color: theme.equalButtonColor,
    },
  };

  const handlePress = (input) => {
    if (input === '=') {
      if (currentInput === '' || ['+', '-', '×', '÷'].includes(currentInput.slice(-1))) {
        setResult('0');
      } else {
        calculateResult();
      }
      return;
    }
  
    if (input === 'C') {
      setCurrentInput('');
      setResult('');
      return;
    }
  
    if (input === 'Del') {
      setCurrentInput(currentInput.slice(0, -1));
      return;
    }
  
    if (['+', '-', '×', '÷'].includes(input)) {
      if (currentInput === '' || ['+', '×', '÷'].includes(currentInput.slice(-1)) || (input === '-' && currentInput.slice(-1) === '-')) return;
      setCurrentInput(currentInput + input);
      return;
    }
  
    if (['sin', 'cos', 'tan', 'cot','sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'cot⁻¹', 'log', 'ln', '√'].includes(input)) {
      setCurrentInput(currentInput + input + '(');
      return;
    }
    if (['π', 'e', '^','!','10^', 'e^'].includes(input)) {
      setCurrentInput(currentInput + input);
      return;
    }   
    if (input === 'x²') {
      setCurrentInput(currentInput + '^2');
      return;
    }   
  
    if (input === 'RAD') {
      setIsRadians(false);
      return;
    }
  
    if (input === 'DEG') {
      setIsRadians(true);
      return;
    }
  
    if (input === '%') {
      if (currentInput !== '' && !isNaN(currentInput)) {
        setCurrentInput((parseFloat(currentInput) / 100).toString());
      }
      return;
    }
  
    if (input === ',' || input === '00' || input === '0') {
      const lastNumber = currentInput.split(/[\+\-\×\÷]/).pop();
  
      if (input === ',' && !lastNumber.includes(',')) {
        setCurrentInput(prevInput => prevInput + ',');
      } else if (input === '00' && lastNumber !== '0' && lastNumber !== '') {
        setCurrentInput(prevInput => prevInput + '00');
      } else if (input === '0' && (lastNumber !== '0' || lastNumber.includes(','))) {
        setCurrentInput(prevInput => prevInput + '0');
      }
      return;
    }   
    setCurrentInput(currentInput + input);
  };

  const clearHistory = () => {
    setHistory([]);
  };

  const balanceParentheses = (expression) => {
    let openCount = 0;
    let closeCount = 0; 
    
    for (let i = 0; i < expression.length; i++) {
      if (expression[i] === '(') {
        openCount++;
      } else if (expression[i] === ')') {
        closeCount++;
      }
    }  
    while (openCount > closeCount) {
      expression += ')';
      closeCount++;
    }  
    return expression;
  };
 
  
  const calculateResult = () => {
    try {
      let expression = currentInput
        .replace(/×/g, '*')
        .replace(/÷/g, '/')
        .replace(/,/g, '.')
        .replace(/sin\(/g, isRadians ? 'sin(' : 'sin((PI / 180) * ')
        .replace(/cot\(/g, isRadians ? 'cot(' : 'cot((PI / 180) * ')
        .replace(/cos\(/g, isRadians ? 'cos(' : 'cos((PI / 180) * ')
        .replace(/tan\(/g, isRadians ? 'tan(' : 'tan((PI / 180) * ')
        .replace(/sin⁻¹\(/g, isRadians ? 'asin(' : '(180 / PI ) * asin(')
        .replace(/cot⁻¹\(/g, isRadians ? 'acot(' : '(180 / PI ) * acot(')
        .replace(/cos⁻¹\(/g, isRadians ? 'acos(' : '(180 / PI ) * acos(')
        .replace(/tan⁻¹\(/g, isRadians ? 'atan(' : '(180 / PI ) * atan(')
        .replace(/log\(/g, 'log10(')        
        .replace(/(\d+)!/g,'factorial($1)')
        .replace(/ln\(/g,  'log(')
        .replace(/π/g, 'PI')
        .replace(/e/g, 'E')        
        .replace(/√\(/g, 'sqrt(');
       
  
        expression = balanceParentheses(expression);
        console.log(expression, isRadians);
        const calculated = math.evaluate(expression).toString();        
       
        setResult(calculated);
        setHistory(prevHistory => [
          { expression: currentInput, result: calculated },
          ...prevHistory
        ]);
     // setCurrentInput(calculated);
    } catch (error) {
      setResult('Error');
      console.log(error);
    }
  };
   
  const getFontSize = (text) => {
    const length = text.length;
    if (length <= 10) return 38;
    if (length <= 20) return 26;
    if (length <= 30) return 18;
    return 20;
  };  

  const getScientificButtons = () => {
    const normalButtons = ['sin', 'cos', 'tan', 'cot', 'log', 'ln', '(', ')', '^', '√', '!', 'π', 'e', 'INV', isRadians ? 'RAD' : 'DEG'];
    const inverseButtons = ['sin⁻¹', 'cos⁻¹', 'tan⁻¹', 'cot⁻¹', '10^', 'e^', '(', ')', '^', 'x²', '!', 'π', 'e', 'INV', isRadians ? 'RAD' : 'DEG'];
    return isInverse ? inverseButtons : normalButtons;
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={[styles.container, dynamicStyles.container]}
    >
      <TouchableOpacity style={styles.darkModeToggle} onPress={toggleDarkMode}>
        <Feather name={isDarkMode ? 'sun' : 'moon'} size={21} color={theme.textColor} />
      </TouchableOpacity>
      <View style={[styles.display, dynamicStyles.display]}>
        <Text style={[styles.inputText, dynamicStyles.inputText, { fontSize: getFontSize(currentInput) }]}>{currentInput}</Text>
        <Text style={[styles.resultText, dynamicStyles.resultText, { fontSize: getFontSize(result) + 10 }]}>{result}</Text>
      </View>
  
      <TouchableOpacity onPress={() => setShowHistory(!showHistory)} style={styles.historyToggle}>
        <Feather name={showHistory ?  "chevron-down" : "clock"} size={20} color={theme.textColor} />
      </TouchableOpacity>
 
      {showHistory && (
        <ScrollView style={styles.historyContainer}>
          {history.map((item, index) => (
            <View key={index} style={styles.historyItem}>
              <Text style={[styles.historyExpression, dynamicStyles.buttonText]}>{item.expression}</Text>
              <Text style={[styles.historyResult, dynamicStyles.buttonText]}>{item.result}</Text>
            </View>
          ))}
          {history.length > 0 && (
            <TouchableOpacity onPress={clearHistory} style={styles.clearHistoryButton}>
              <Text style={[styles.clearHistoryText, dynamicStyles.buttonText]}>Xóa</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      )}

      <TouchableOpacity onPress={() => {setShowScientific(!showScientific);
       if (!showScientific && showHistory) {
          setShowHistory(false); 
       }}}>
        <Text style={[styles.toggleButton, dynamicStyles.toggleButton]}>
          {showScientific ? '≡' : '≡'}
        </Text>
      </TouchableOpacity>

      {showScientific && (
        <Animated.View style={[styles.scientificButtons, dynamicStyles.scientificButtons, { opacity: fadeAnim }]}>
          {getScientificButtons().map((btn) => (
            <TouchableOpacity 
              key={btn} 
              style={styles.Sc_button} 
              onPress={() => {
                if (btn === 'INV') {
                  setIsInverse(!isInverse);
                } else {
                  handlePress(btn);
                }
              }}
            >
              <Text style={styles.Sc_buttonText}>{btn}</Text>
            </TouchableOpacity>
          ))}
        </Animated.View>
      )}

      <View style={styles.buttons}>           
          {['C', '%', 'Del', '÷', '7', '8', '9', '×', '4', '5', '6', '-', '1', '2', '3', '+', '00', '0', ',', '='].map((btn) => {          
            let textStyle = dynamicStyles.buttonText;
            if (['+', '-', '×', '÷', '=' ].includes(btn)) {            
              textStyle = dynamicStyles.operatorButtonText;
            }
            return (
              <TouchableOpacity key={btn} style={[styles.St_button]} onPress={() => handlePress(btn)}>
                {btn === 'Del' ? (
                  <Feather name="delete" size={32} color={theme.textColor} />
                ) : (
                  <Text style={[styles.buttonText, textStyle]}>{btn}</Text>
                )}
              </TouchableOpacity>
        );
      })}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  display: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end',
    padding: 20,
    marginTop: 20,
  },
  inputText: {
    marginBottom: 5,
  },
  resultText: {
    fontWeight: 'bold',
  },
  scientificButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
  },
  buttons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  Sc_button: {
    width: '20%',
    height: 45,
    justifyContent: 'center',
    alignItems: 'center',
  },
  St_button: {
    width: '25%',
    height: 60,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    fontSize: 32,
  },
  Sc_buttonText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#fffffe',
  },
  toggleButton: {
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 10,
  },
  darkModeToggle: {
    position: 'absolute',
    top: 25,
    left: 10,
    zIndex: 1,
   
  },  
  historyToggle: {
    padding: 5,
   
  },
  historyContainer: {
    maxHeight: 200,
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  historyItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  historyExpression: {
    fontSize: 16,
  },
  historyResult: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#00ebc7',
  },
  clearHistoryButton: {
    alignItems: 'center',
    padding: 10,
  },
  clearHistoryText: {
    fontSize: 16,
    color: '#00b9b9',
  },
});
  