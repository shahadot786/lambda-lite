// Sample code examples from beginner to expert level - ALL TESTED AND WORKING

export interface CodeExample {
  id: string;
  title: string;
  description: string;
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert';
  category: string;
  code: string;
  args: any[];
  expectedResult?: any;
}

export const codeExamples: CodeExample[] = [
  // ==================== BEGINNER LEVEL ====================
  {
    id: 'add-numbers',
    title: 'Add Two Numbers',
    description: 'Simple addition of two numbers',
    level: 'beginner',
    category: 'Math',
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
    category: 'Strings',
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
    category: 'Arrays',
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
    category: 'Math',
    code: `function main(a, b) {
  const max = a > b ? a : b;
  console.log('Max of', a, 'and', b, 'is', max);
  return max;
}`,
    args: [10, 25],
    expectedResult: 25,
  },
  {
    id: 'even-odd',
    title: 'Even or Odd',
    description: 'Check if a number is even or odd',
    level: 'beginner',
    category: 'Math',
    code: `function main(num) {
  const result = num % 2 === 0 ? 'even' : 'odd';
  console.log(num, 'is', result);
  return result;
}`,
    args: [7],
    expectedResult: 'odd',
  },
  {
    id: 'reverse-string',
    title: 'Reverse String',
    description: 'Reverse a string using built-in methods',
    level: 'beginner',
    category: 'Strings',
    code: `function main(str) {
  const reversed = str.split('').reverse().join('');
  console.log('Original:', str);
  console.log('Reversed:', reversed);
  return reversed;
}`,
    args: ['Hello World'],
    expectedResult: 'dlroW olleH',
  },

  // ==================== INTERMEDIATE LEVEL ====================
  {
    id: 'fibonacci',
    title: 'Fibonacci Sequence',
    description: 'Generate Fibonacci numbers up to n',
    level: 'intermediate',
    category: 'Algorithms',
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
    category: 'Strings',
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
    category: 'Math',
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
    category: 'Arrays',
    code: `function main(numbers) {
  const sum = numbers.reduce((acc, num) => acc + num, 0);
  const avg = sum / numbers.length;
  
  console.log('Numbers:', numbers);
  console.log('Sum:', sum);
  console.log('Average:', avg);
  
  return { sum: sum, average: avg };
}`,
    args: [[10, 20, 30, 40, 50]],
    expectedResult: { sum: 150, average: 30 },
  },
  {
    id: 'count-vowels',
    title: 'Count Vowels',
    description: 'Count vowels in a string',
    level: 'intermediate',
    category: 'Strings',
    code: `function main(str) {
  const vowels = 'aeiouAEIOU';
  let count = 0;
  
  for (let char of str) {
    if (vowels.includes(char)) {
      count++;
    }
  }
  
  console.log('String:', str);
  console.log('Vowel count:', count);
  return count;
}`,
    args: ['Hello World'],
    expectedResult: 3,
  },
  {
    id: 'find-duplicates',
    title: 'Find Duplicates',
    description: 'Find duplicate elements in an array',
    level: 'intermediate',
    category: 'Arrays',
    code: `function main(arr) {
  const seen = {};
  const duplicates = [];
  
  for (let item of arr) {
    if (seen[item]) {
      if (!duplicates.includes(item)) {
        duplicates.push(item);
      }
    } else {
      seen[item] = true;
    }
  }
  
  console.log('Array:', arr);
  console.log('Duplicates:', duplicates);
  return duplicates;
}`,
    args: [[1, 2, 3, 2, 4, 5, 3, 6]],
    expectedResult: [2, 3],
  },

  // ==================== ADVANCED LEVEL ====================
  {
    id: 'factorial-recursive',
    title: 'Recursive Factorial',
    description: 'Calculate factorial using recursion',
    level: 'advanced',
    category: 'Recursion',
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
    category: 'Algorithms',
    code: `function quickSort(arr) {
  if (arr.length <= 1) return arr;
  
  const pivot = arr[Math.floor(arr.length / 2)];
  const left = arr.filter(x => x < pivot);
  const middle = arr.filter(x => x === pivot);
  const right = arr.filter(x => x > pivot);
  
  return quickSort(left).concat(middle).concat(quickSort(right));
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
    category: 'Algorithms',
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
    id: 'merge-sorted',
    title: 'Merge Sorted Arrays',
    description: 'Merge two sorted arrays into one',
    level: 'advanced',
    category: 'Arrays',
    code: `function main(arr1, arr2) {
  const merged = [];
  let i = 0, j = 0;
  
  while (i < arr1.length && j < arr2.length) {
    if (arr1[i] < arr2[j]) {
      merged.push(arr1[i++]);
    } else {
      merged.push(arr2[j++]);
    }
  }
  
  while (i < arr1.length) merged.push(arr1[i++]);
  while (j < arr2.length) merged.push(arr2[j++]);
  
  console.log('Array 1:', arr1);
  console.log('Array 2:', arr2);
  console.log('Merged:', merged);
  return merged;
}`,
    args: [[1, 3, 5, 7], [2, 4, 6, 8]],
    expectedResult: [1, 2, 3, 4, 5, 6, 7, 8],
  },
  {
    id: 'flatten-array',
    title: 'Flatten Nested Array',
    description: 'Flatten a deeply nested array',
    level: 'advanced',
    category: 'Arrays',
    code: `function flatten(arr) {
  const result = [];
  
  for (let item of arr) {
    if (Array.isArray(item)) {
      result.push(...flatten(item));
    } else {
      result.push(item);
    }
  }
  
  return result;
}

function main(arr) {
  console.log('Nested:', JSON.stringify(arr));
  const flat = flatten(arr);
  console.log('Flattened:', flat);
  return flat;
}`,
    args: [[[1, 2], [3, [4, 5]], [[6]], 7]],
    expectedResult: [1, 2, 3, 4, 5, 6, 7],
  },
  {
    id: 'anagram-checker',
    title: 'Anagram Checker',
    description: 'Check if two strings are anagrams',
    level: 'advanced',
    category: 'Strings',
    code: `function main(str1, str2) {
  const clean = s => s.toLowerCase().replace(/[^a-z]/g, '').split('').sort().join('');
  
  const cleaned1 = clean(str1);
  const cleaned2 = clean(str2);
  const isAnagram = cleaned1 === cleaned2;
  
  console.log('String 1:', str1);
  console.log('String 2:', str2);
  console.log('Are anagrams:', isAnagram);
  
  return isAnagram;
}`,
    args: ['listen', 'silent'],
    expectedResult: true,
  },

  // ==================== EXPERT LEVEL ====================
  {
    id: 'deep-clone',
    title: 'Deep Clone Object',
    description: 'Deep clone nested objects and arrays',
    level: 'expert',
    category: 'Objects',
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
  
  cloned.nested.value = 'modified';
  
  console.log('Cloned (modified):', JSON.stringify(cloned));
  console.log('Original (unchanged):', JSON.stringify(obj));
  
  return {
    original: obj,
    cloned: cloned
  };
}`,
    args: [{
      name: 'test',
      nested: { value: 'original', array: [1, 2, 3] },
      list: [{ id: 1 }, { id: 2 }]
    }],
  },
  {
    id: 'memoization',
    title: 'Fibonacci with Memoization',
    description: 'Optimize fibonacci using memoization',
    level: 'expert',
    category: 'Optimization',
    code: `function main(n) {
  const memo = {};
  let callCount = 0;
  
  function fib(num) {
    callCount++;
    if (num in memo) return memo[num];
    if (num <= 1) return num;
    
    memo[num] = fib(num - 1) + fib(num - 2);
    return memo[num];
  }
  
  console.log('Calculating fibonacci(' + n + ')');
  const result = fib(n);
  console.log('Result:', result);
  console.log('Function calls:', callCount);
  
  return { result: result, calls: callCount };
}`,
    args: [20],
  },
  {
    id: 'lru-cache',
    title: 'LRU Cache',
    description: 'Implement Least Recently Used cache',
    level: 'expert',
    category: 'Data Structures',
    code: `function createLRUCache(capacity) {
  const cache = new Map();
  
  return {
    get: function(key) {
      if (!cache.has(key)) return -1;
      const value = cache.get(key);
      cache.delete(key);
      cache.set(key, value);
      return value;
    },
    put: function(key, value) {
      if (cache.has(key)) {
        cache.delete(key);
      }
      cache.set(key, value);
      if (cache.size > capacity) {
        const firstKey = cache.keys().next().value;
        cache.delete(firstKey);
      }
    },
    toString: function() {
      return Array.from(cache.entries());
    }
  };
}

function main(capacity, operations) {
  const cache = createLRUCache(capacity);
  const results = [];
  
  for (const op of operations) {
    if (op.type === 'put') {
      cache.put(op.key, op.value);
      console.log('Put:', op.key, '=', op.value);
    } else {
      const val = cache.get(op.key);
      console.log('Get:', op.key, '=', val);
      results.push(val);
    }
  }
  
  console.log('Final cache:', cache.toString());
  return results;
}`,
    args: [2, [
      { type: 'put', key: 1, value: 1 },
      { type: 'put', key: 2, value: 2 },
      { type: 'get', key: 1 },
      { type: 'put', key: 3, value: 3 },
      { type: 'get', key: 2 }
    ]],
  },
  {
    id: 'trie-autocomplete',
    title: 'Trie Autocomplete',
    description: 'Implement autocomplete using Trie',
    level: 'expert',
    category: 'Data Structures',
    code: `function createTrie() {
  const root = {};
  
  function insert(word) {
    let node = root;
    for (const char of word) {
      if (!node[char]) node[char] = {};
      node = node[char];
    }
    node.isEnd = true;
  }
  
  function search(prefix) {
    let node = root;
    for (const char of prefix) {
      if (!node[char]) return [];
      node = node[char];
    }
    
    const results = [];
    function dfs(node, word) {
      if (node.isEnd) results.push(word);
      for (const char in node) {
        if (char !== 'isEnd') {
          dfs(node[char], word + char);
        }
      }
    }
    dfs(node, prefix);
    return results;
  }
  
  return { insert, search };
}

function main(words, prefix) {
  const trie = createTrie();
  
  console.log('Building trie with:', words);
  for (const word of words) {
    trie.insert(word);
  }
  
  console.log('Searching for prefix:', prefix);
  const matches = trie.search(prefix);
  console.log('Matches:', matches);
  
  return matches;
}`,
    args: [['apple', 'app', 'application', 'apply', 'banana', 'band'], 'app'],
  },
  {
    id: 'graph-bfs',
    title: 'Graph BFS Traversal',
    description: 'Breadth-first search on a graph',
    level: 'expert',
    category: 'Algorithms',
    code: `function main(graph, start) {
  const visited = new Set();
  const queue = [start];
  const result = [];
  
  visited.add(start);
  
  while (queue.length > 0) {
    const node = queue.shift();
    result.push(node);
    console.log('Visiting:', node);
    
    for (const neighbor of graph[node] || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        queue.push(neighbor);
      }
    }
  }
  
  console.log('BFS traversal:', result);
  return result;
}`,
    args: [{
      'A': ['B', 'C'],
      'B': ['A', 'D', 'E'],
      'C': ['A', 'F'],
      'D': ['B'],
      'E': ['B', 'F'],
      'F': ['C', 'E']
    }, 'A'],
  },
];

export function getExamplesByLevel(level: CodeExample['level']): CodeExample[] {
  return codeExamples.filter(ex => ex.level === level);
}

export function getExamplesByCategory(category: string): CodeExample[] {
  return codeExamples.filter(ex => ex.category === category);
}

export function getExampleById(id: string): CodeExample | undefined {
  return codeExamples.find(ex => ex.id === id);
}

export const categories = [...new Set(codeExamples.map(ex => ex.category))];
