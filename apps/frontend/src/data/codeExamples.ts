// Sample code examples from beginner to expert level

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  code: string;
  args: any[];
  expectedResult?: any;
}

export const codeExamples: CodeExample[] = [
  // BEGINNER LEVEL
  {
    id: 'add-numbers',
    title: 'Add Two Numbers',
    description: 'Simple addition of two numbers',
    level: 'beginner',
    code: `function main(a, b) {
  console.log('Adding', a, 'and', b);
  return a + b;
}`,
    args: [5, 3],
    expectedResult: 8,
  },
  {
    id: 'string-concat',
    title: 'String Concatenation',
    description: 'Combine two strings',
    level: 'beginner',
    code: `function main(firstName, lastName) {
  const fullName = firstName + ' ' + lastName;
  console.log('Full name:', fullName);
  return fullName;
}`,
    args: ['John', 'Doe'],
    expectedResult: 'John Doe',
  },
  {
    id: 'array-length',
    title: 'Array Length',
    description: 'Get the length of an array',
    level: 'beginner',
    code: `function main(arr) {
  console.log('Array:', arr);
  console.log('Length:', arr.length);
  return arr.length;
}`,
    args: [[1, 2, 3, 4, 5]],
    expectedResult: 5,
  },
  {
    id: 'max-number',
    title: 'Find Maximum',
    description: 'Find the maximum of two numbers',
    level: 'beginner',
    code: `function main(a, b) {
  const max = a > b ? a : b;
  console.log('Max of', a, 'and', b, 'is', max);
  return max;
}`,
    args: [10, 25],
    expectedResult: 25,
  },

  // INTERMEDIATE LEVEL
  {
    id: 'fibonacci',
    title: 'Fibonacci Sequence',
    description: 'Generate Fibonacci numbers up to n',
    level: 'intermediate',
    code: `function main(n) {
  const fib = [0, 1];
  
  for (let i = 2; i < n; i++) {
    fib[i] = fib[i - 1] + fib[i - 2];
  }
  
  console.log('Fibonacci sequence:', fib);
  return fib;
}`,
    args: [10],
    expectedResult: [0, 1, 1, 2, 3, 5, 8, 13, 21, 34],
  },
  {
    id: 'palindrome',
    title: 'Palindrome Checker',
    description: 'Check if a string is a palindrome',
    level: 'intermediate',
    code: `function main(str) {
  const cleaned = str.toLowerCase().replace(/[^a-z0-9]/g, '');
  const reversed = cleaned.split('').reverse().join('');
  const isPalindrome = cleaned === reversed;
  
  console.log('Original:', str);
  console.log('Cleaned:', cleaned);
  console.log('Is palindrome:', isPalindrome);
  
  return isPalindrome;
}`,
    args: ['A man, a plan, a canal: Panama'],
    expectedResult: true,
  },
  {
    id: 'prime-numbers',
    title: 'Prime Number Generator',
    description: 'Find all prime numbers up to n',
    level: 'intermediate',
    code: `function main(n) {
  const primes = [];
  
  for (let num = 2; num <= n; num++) {
    let isPrime = true;
    
    for (let i = 2; i <= Math.sqrt(num); i++) {
      if (num % i === 0) {
        isPrime = false;
        break;
      }
    }
    
    if (isPrime) {
      primes.push(num);
    }
  }
  
  console.log('Primes up to', n + ':', primes);
  return primes;
}`,
    args: [20],
    expectedResult: [2, 3, 5, 7, 11, 13, 17, 19],
  },
  {
    id: 'array-sum',
    title: 'Array Sum with Reduce',
    description: 'Sum array elements using reduce',
    level: 'intermediate',
    code: `function main(numbers) {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const avg = sum / numbers.length;
  
  console.log('Numbers:', numbers);
  console.log('Sum:', sum);
  console.log('Average:', avg);
  
  return { sum, average: avg };
}`,
    args: [[10, 20, 30, 40, 50]],
    expectedResult: { sum: 150, average: 30 },
  },

  // ADVANCED LEVEL
  {
    id: 'factorial-recursive',
    title: 'Recursive Factorial',
    description: 'Calculate factorial using recursion',
    level: 'advanced',
    code: `function factorial(n) {
  if (n <= 1) return 1;
  return n * factorial(n - 1);
}

function main(n) {
  console.log('Calculating factorial of', n);
  const result = factorial(n);
  console.log(n + '! =', result);
  return result;
}`,
    args: [10],
    expectedResult: 3628800,
  },
  {
    id: 'quicksort',
    title: 'QuickSort Algorithm',
    description: 'Sort array using quicksort',
    level: 'advanced',
    code: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return [...quickSort(left), ...middle, ...quickSort(right)];
}

function main(arr) {
  console.log('Original:', arr);
  const sorted = quickSort(arr);
  console.log('Sorted:', sorted);
  return sorted;
}`,
    args: [[64, 34, 25, 12, 22, 11, 90]],
    expectedResult: [11, 12, 22, 25, 34, 64, 90],
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    description: 'Search in sorted array using binary search',
    level: 'advanced',
    code: `function binarySearch(arr, target) {
  let left = 0;
  let right = arr.length - 1;
  
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    console.log('Checking index', mid, ':', arr[mid]);
    
    if (arr[mid] === target) {
      return mid;
    } else if (arr[mid] < target) {
      left = mid + 1;
    } else {
      right = mid - 1;
    }
  }
  
  return -1;
}

function main(arr, target) {
  console.log('Searching for', target, 'in', arr);
  const index = binarySearch(arr, target);
  console.log('Found at index:', index);
  return index;
}`,
    args: [[1, 3, 5, 7, 9, 11, 13, 15, 17, 19], 13],
    expectedResult: 6,
  },
  {
    id: 'memoization',
    title: 'Fibonacci with Memoization',
    description: 'Optimize fibonacci using memoization',
    level: 'advanced',
    code: `function main(n) {
  const memo = {};
  
  function fib(num) {
    if (num in memo) return memo[num];
    if (num <= 1) return num;
    
    memo[num] = fib(num - 1) + fib(num - 2);
    return memo[num];
  }
  
  console.log('Calculating fibonacci(' + n + ') with memoization');
  const result = fib(n);
  console.log('Result:', result);
  console.log('Memo cache:', memo);
  
  return result;
}`,
    args: [20],
    expectedResult: 6765,
  },

  // EXPERT LEVEL
  {
    id: 'async-promises',
    title: 'Async Promise Chain',
    description: 'Handle async operations with promises',
    level: 'expert',
    code: `function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main(tasks) {
  console.log('Starting async tasks...');
  const results = [];
  
  for (const task of tasks) {
    console.log('Processing:', task.name);
    await delay(task.duration);
    results.push({
      name: task.name,
      completed: true,
      timestamp: Date.now()
    });
  }
  
  console.log('All tasks completed!');
  return results;
}`,
    args: [[
      { name: 'Task 1', duration: 100 },
      { name: 'Task 2', duration: 50 },
      { name: 'Task 3', duration: 75 }
    ]],
  },
  {
    id: 'closure-counter',
    title: 'Closure Pattern',
    description: 'Implement counter using closures',
    level: 'expert',
    code: `function createCounter(initial = 0) {
  let count = initial;
  
  return {
    increment: () => ++count,
    decrement: () => --count,
    getValue: () => count,
    reset: () => { count = initial; return count; }
  };
}

function main(operations) {
  const counter = createCounter(0);
  const results = [];
  
  for (const op of operations) {
    console.log('Operation:', op);
    const result = counter[op]();
    console.log('Result:', result);
    results.push(result);
  }
  
  return results;
}`,
    args: [['increment', 'increment', 'increment', 'decrement', 'getValue']],
    expectedResult: [1, 2, 3, 2, 2],
  },
  {
    id: 'deep-clone',
    title: 'Deep Clone Object',
    description: 'Deep clone nested objects and arrays',
    level: 'expert',
    code: `function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }
  
  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item));
  }
  
  const cloned = {};
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      cloned[key] = deepClone(obj[key]);
    }
  }
  
  return cloned;
}

function main(obj) {
  console.log('Original:', JSON.stringify(obj));
  const cloned = deepClone(obj);
  
  // Modify clone to prove it's independent
  cloned.nested.value = 'modified';
  
  console.log('Cloned:', JSON.stringify(cloned));
  console.log('Original unchanged:', JSON.stringify(obj));
  
  return {
    original: obj,
    cloned: cloned,
    areEqual: JSON.stringify(obj) !== JSON.stringify(cloned)
  };
}`,
    args: [{
      name: 'test',
      nested: { value: 'original', array: [1, 2, 3] },
      list: [{ id: 1 }, { id: 2 }]
    }],
  },
  {
    id: 'debounce',
    title: 'Debounce Function',
    description: 'Implement debounce pattern',
    level: 'expert',
    code: `function debounce(func, delay) {
  let timeoutId;
  
  return function(...args) {
    clearTimeout(timeoutId);
    
    return new Promise((resolve) => {
      timeoutId = setTimeout(() => {
        resolve(func(...args));
      }, delay);
    });
  };
}

async function main(calls, delay) {
  let callCount = 0;
  
  const expensiveOperation = (value) => {
    callCount++;
    console.log('Expensive operation called with:', value);
    return value * 2;
  };
  
  const debouncedOp = debounce(expensiveOperation, delay);
  
  // Simulate rapid calls
  const promises = calls.map(value => debouncedOp(value));
  const results = await Promise.all(promises);
  
  console.log('Total calls:', callCount);
  console.log('Results:', results);
  
  return { callCount, results };
}`,
    args: [[1, 2, 3, 4, 5], 100],
  },
];

export function getExamplesByLevel(level: CodeExample['level']): CodeExample[] {
  return codeExamples.filter(ex => ex.level === level);
}

export function getExampleById(id: string): CodeExample | undefined {
  return codeExamples.find(ex => ex.id === id);
}
