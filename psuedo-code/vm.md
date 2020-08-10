
# Get Listeners

```javascript

Object.keys(window).sort().filter((key, i)=>{
  try {
    // accept on listeners
    return /^on\w+/.test(key);
  } catch(e){
    return false
  }
})

```

# Get Methods

```javascript

Object.keys(window).sort().filter((key, i)=>{
  try {
    // no listeners
    if(/^on\w+/.test(key)){
      return false
    }
    // get Classes
    if(/^[A-Z].*/.test(key)){
      return false
    }

    // accept type function
    if(typeof window[key] === "function"){
      return true
    }
    return false
  } catch(e){
    return false
  }
})

```

# Get Values

```javascript

Object.keys(window).sort().filter((key, i)=>{
  try {
    // no listeners
    if(/^on\w+/.test(key)){
      return false
    }

    // get Classes
    if(/^[A-Z].*/.test(key)){
      return true
    }

    // no functions
    if(typeof window[key] === "function"){
      return false
    }

    return true
  } catch(e){
    return true
  }
})


```
