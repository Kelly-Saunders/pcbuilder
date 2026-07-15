# 💻 _CUSTOM RIG BUILDER // Interactive 2D PC Configurator

An interactive, responsive, and highly visual web application that allows users to assemble a custom computer in real-time. Built entirely with **vanilla HTML5, CSS3, and ES6+ JavaScript**, this project showcases clean state management, dynamic DOM manipulation, and relational logic without the reliance on heavy frontend frameworks.

🔗 **[Live Demo Hosted on GitHub Pages](https://kelly-saunders.github.io/pcbuilder/)**

---

## 🚀 Key Features

* **Interactive 2D Assembly Engine:** Selecting components dynamically renders high-quality transparent assets directly into the case chassis using absolute coordinates and layering (`z-index`).
* **Real-Time Compatibility Matrix:** Programmatic verification checking CPU sockets against Motherboard chipsets (e.g., AM5 vs. LGA1700) to prevent builder errors.
* **Dynamic Power Calculation:** Real-time load summation that checks system power draws against the selected PSU capacity, triggering adaptive warning states.
* **Zero-Framework Architecture:** Built entirely with raw web standards to demonstrate an absolute understanding of native browser APIs, modern CSS layout techniques (Grid/Flexbox), and asynchronous fetch calls.

---

## 🛠️ The Tech Stack

* **Frontend:** HTML5, CSS3 (Custom Variables, Flexbox, CSS Grid)
* **Backend / Logic:** Vanilla ES6+ JavaScript (Asynchronous APIs, Event-Driven Architecture)
* **Database:** Structured JSON (`parts.json`)

---

## 🧠 Architectural Deep Dive

### 1. State Management & DOM Syncing
Instead of rebuilding the UI on every click, the app utilizes a centralized state machine. The current build state is tracked in a single JavaScript object:

```javascript
const currentBuild = {
    CPU: null,
    Motherboard: null,
    GPU: null,
    RAM: null,
    Storage: null,
    PSU: null
};
