export type DesignQuestion = {
  id: string;
  title: string;
  prompts: string[];
};

/** Curated low-level / OOP design prompts */
export const LLD_QUESTIONS: DesignQuestion[] = [
  {
    id: "lld-parking-lot",
    title: "Design a parking lot system",
    prompts: ["Multiple floors", "Vehicle types", "Ticket + payment"],
  },
  {
    id: "lld-elevator",
    title: "Design an elevator system",
    prompts: ["Multiple elevators", "Request scheduling", "Emergency mode"],
  },
  {
    id: "lld-library",
    title: "Design a library management system",
    prompts: ["Borrow/return", "Reservations", "Fines"],
  },
  {
    id: "lld-atm",
    title: "Design an ATM",
    prompts: ["Auth", "Withdraw/deposit", "Transaction log"],
  },
  {
    id: "lld-chess",
    title: "Design a chess game",
    prompts: ["Board + pieces", "Valid moves", "Check/checkmate"],
  },
  {
    id: "lld-snake-ladder",
    title: "Design Snake and Ladder",
    prompts: ["Board", "Dice", "Multiplayer turns"],
  },
  {
    id: "lld-vending",
    title: "Design a vending machine",
    prompts: ["Inventory", "Payment states", "Dispense"],
  },
  {
    id: "lld-logger",
    title: "Design a logging framework",
    prompts: ["Log levels", "Appenders", "Async logging"],
  },
];

export function randomLldQuestion(): DesignQuestion {
  return LLD_QUESTIONS[Math.floor(Math.random() * LLD_QUESTIONS.length)]!;
}
