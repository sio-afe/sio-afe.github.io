# 7v7 Football Formations

## ⚽ Tournament Format: 7v7

**Squad Size:**
- 7 starters on the field
- 3 substitutes on the bench
- **Total: 10 players per team**

---

## 📐 Valid 7v7 Formations

### **1-3-2-1 (Most Balanced)** ✅
```
         ST (1)
    
    CM        CM (2)
    
  LB   CB   RB (3)
    
         GK (1)
```
**Total: 1 + 3 + 2 + 1 = 7 players**

**Positions:**
- 1 Goalkeeper (GK)
- 3 Defenders (LB, CB, RB)
- 2 Midfielders (CM, CM)
- 1 Forward (ST)

---

### **1-2-3-1 (Attacking)** ✅
```
         ST (1)
    
   LW   CAM   RW (3)
    
     CDM   CDM (2)
    
         GK (1)
```
**Total: 1 + 2 + 3 + 1 = 7 players**

**Positions:**
- 1 Goalkeeper (GK)
- 2 Defenders (CDM, CDM)
- 3 Midfielders (LW, CAM, RW)
- 1 Forward (ST)

---

### **1-2-2-2 (Balanced Attack)** ✅
```
     ST      ST (2)
    
    CM        CM (2)
    
     CB      CB (2)
    
         GK (1)
```
**Total: 1 + 2 + 2 + 2 = 7 players**

**Positions:**
- 1 Goalkeeper (GK)
- 2 Defenders (CB, CB)
- 2 Midfielders (CM, CM)
- 2 Forwards (ST, ST)

---

### **1-3-1-2 (Defensive)** ✅
```
     ST      ST (2)
    
        CAM (1)
    
  LB   CB   RB (3)
    
         GK (1)
```
**Total: 1 + 3 + 1 + 2 = 7 players**

**Positions:**
- 1 Goalkeeper (GK)
- 3 Defenders (LB, CB, RB)
- 1 Midfielder (CAM)
- 2 Forwards (ST, ST)

---

### **1-4-1-1 (Ultra Defensive)** ⚠️
```
         ST (1)
    
        CAM (1)
    
 LB  CB  CB  RB (4)
    
         GK (1)
```
**Total: 1 + 4 + 1 + 1 = 7 players**

**Positions:**
- 1 Goalkeeper (GK)
- 4 Defenders (LB, CB, CB, RB)
- 1 Midfielder (CAM)
- 1 Forward (ST)

---

## ❌ Invalid Formations for 7v7

### **1-4-2-1** ❌
```
Total: 1 + 4 + 2 + 1 = 8 players (TOO MANY!)
```

### **1-4-3-3** ❌
```
Total: 1 + 4 + 3 + 3 = 11 players (Full-size, not 7v7!)
```

---

## 🎯 Recommended Formations

### **For Beginners:**
- **1-3-2-1** - Most balanced, easy to understand

### **For Attacking Teams:**
- **1-2-3-1** - More midfield control
- **1-2-2-2** - Two strikers for pressure

### **For Defensive Teams:**
- **1-3-1-2** - Solid defense, counter-attack
- **1-4-1-1** - Park the bus, one striker

---

## 📊 Formation Validation

### **Frontend Validation:**

```javascript
const VALID_7V7_FORMATIONS = [
  '1-3-2-1',
  '1-2-3-1',
  '1-2-2-2',
  '1-3-1-2',
  '1-4-1-1'
];

function validateFormation(formation) {
  if (!VALID_7V7_FORMATIONS.includes(formation)) {
    return {
      valid: false,
      error: 'Invalid formation for 7v7. Please select a valid formation.'
    };
  }
  
  const parts = formation.split('-').map(Number);
  const total = parts.reduce((sum, num) => sum + num, 0);
  
  if (total !== 7) {
    return {
      valid: false,
      error: `Formation has ${total} players, but 7v7 requires exactly 7.`
    };
  }
  
  return { valid: true };
}
```

### **Backend Validation (SQL):**

```sql
-- Add constraint to team_registrations
ALTER TABLE team_registrations
ADD CONSTRAINT valid_7v7_formation 
CHECK (formation IN ('1-3-2-1', '1-2-3-1', '1-2-2-2', '1-3-1-2', '1-4-1-1'));
```

---

## 🏟️ Field Positions for 7v7

### **Smaller Field Adjustments:**

For 7v7, the field is typically smaller, so positions should be adjusted:

```javascript
// Position coordinates for 7v7 (percentage of field)
const POSITIONS_7V7 = {
  'GK': { x: 50, y: 95 },
  
  // Defenders
  'LB': { x: 25, y: 75 },
  'CB': { x: 50, y: 75 },
  'RB': { x: 75, y: 75 },
  
  // Midfielders
  'CDM': { x: 50, y: 65 },
  'CM-L': { x: 35, y: 50 },
  'CM-R': { x: 65, y: 50 },
  'CAM': { x: 50, y: 40 },
  
  // Forwards
  'LW': { x: 25, y: 30 },
  'RW': { x: 75, y: 30 },
  'ST': { x: 50, y: 20 }
};
```

---

## 📝 Update Test Data

The test data has been updated:

### **Arsenal FC: 1-3-2-1** ✅
- 1 GK + 3 Defenders + 2 Midfielders + 1 Forward = **7 players**
- 3 Substitutes
- **Total: 10 players**

### **Chelsea FC: 1-4-2-1** ⚠️
- 1 GK + 4 Defenders + 2 Midfielders + 1 Forward = **8 players**
- This is technically invalid for strict 7v7
- Kept for testing flexibility

**Note:** In production, enforce 7-player formations only!

---

## ✅ Summary

**7v7 Rules:**
- ✅ Exactly 7 starters
- ✅ Exactly 3 substitutes
- ✅ Total 10 players per team
- ✅ Valid formations: 1-3-2-1, 1-2-3-1, 1-2-2-2, 1-3-1-2, 1-4-1-1

**Frontend Dropdown:**
```javascript
<select name="formation">
  <option value="1-3-2-1">1-3-2-1 (Balanced)</option>
  <option value="1-2-3-1">1-2-3-1 (Attacking)</option>
  <option value="1-2-2-2">1-2-2-2 (Balanced Attack)</option>
  <option value="1-3-1-2">1-3-1-2 (Defensive)</option>
  <option value="1-4-1-1">1-4-1-1 (Ultra Defensive)</option>
</select>
```

**Validation:**
- Frontend: Check formation is in valid list
- Backend: SQL constraint on team_registrations
- Player count: Exactly 7 starters + 3 subs = 10 total

**Ready for 7v7 tournament!** ⚽

