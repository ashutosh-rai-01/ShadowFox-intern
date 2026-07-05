import mongoose from "mongoose";

// Setup storage for In-Memory Fallback
const mockStorage = {
  User: [],
  Cheer: [],
  Ticket: [],
  Order: []
};

// Seed default cheers for the live wall
mockStorage.Cheer = [
  {
    _id: "cheer1",
    username: "KohliFan_18",
    content: "King Kohli is going to smash a century tonight! Let's go RCB!",
    playerTag: "Virat Kohli",
    likes: 42,
    timestamp: new Date(Date.now() - 1000 * 60 * 15)
  },
  {
    _id: "cheer2",
    username: "PlayBoldDaily",
    content: "Chinnaswamy is buzzing! Ee Sala Cup Namde! 🏆 #PlayBold",
    playerTag: "Faf du Plessis",
    likes: 29,
    timestamp: new Date(Date.now() - 1000 * 60 * 8)
  },
  {
    _id: "cheer3",
    username: "SirajMiang",
    content: "Siraj's spell in the powerplay is going to be crucial today. Clean bowled incoming!",
    playerTag: "Mohammed Siraj",
    likes: 18,
    timestamp: new Date(Date.now() - 1000 * 60 * 2)
  }
];

let isMockMode = false;

// Mock Class definition mimicking Mongoose behavior
class MockModel {
  constructor(data) {
    Object.assign(this, data);
    if (!this._id) {
      this._id = "mock_" + Math.random().toString(36).substring(2, 9);
    }
    const modelName = this.constructor.name.replace("Mock", "");
    if (!this.timestamp && modelName === "Cheer") {
      this.timestamp = new Date();
    }
    if (!this.bookingDate && modelName === "Ticket") {
      this.bookingDate = new Date();
    }
    if (!this.orderDate && modelName === "Order") {
      this.orderDate = new Date();
    }
  }

  async save() {
    const modelName = this.constructor.name.replace("Mock", "");
    const list = mockStorage[modelName];
    const idx = list.findIndex(item => item._id === this._id);
    if (idx >= 0) {
      list[idx] = this;
    } else {
      list.push(this);
    }
    return this;
  }

  static async find(query = {}) {
    const modelName = this.name.replace("Mock", "");
    let results = mockStorage[modelName] || [];
    return results.filter(item => {
      for (let key in query) {
        if (query[key] && typeof query[key] === 'object' && query[key].$in) {
          if (!query[key].$in.includes(item[key])) return false;
        } else if (item[key] !== query[key]) {
          return false;
        }
      }
      return true;
    }).map(item => new this(item));
  }

  static async findOne(query = {}) {
    const results = await this.find(query);
    return results[0] || null;
  }

  static async findById(id) {
    const modelName = this.name.replace("Mock", "");
    const results = mockStorage[modelName] || [];
    const item = results.find(item => item._id === id);
    return item ? new this(item) : null;
  }

  static async findByIdAndUpdate(id, update, options = {}) {
    const modelName = this.name.replace("Mock", "");
    const results = mockStorage[modelName] || [];
    const idx = results.findIndex(item => item._id === id);
    if (idx >= 0) {
      if (update.$inc) {
        for (let key in update.$inc) {
          results[idx][key] = (results[idx][key] || 0) + update.$inc[key];
        }
      } else {
        Object.assign(results[idx], update);
      }
      return new this(results[idx]);
    }
    return null;
  }

  static async create(data) {
    const instance = new this(data);
    await instance.save();
    return instance;
  }
}

class UserMock extends MockModel {}
class CheerMock extends MockModel {}
class TicketMock extends MockModel {}
class OrderMock extends MockModel {}

// Mongoose Schemas (for true MongoDB mode)
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  favoritePlayer: { type: String, default: "Virat Kohli" },
  tier: { type: String, default: "Rookie" },
  fanCardNumber: { type: String, required: true }
});

const CheerSchema = new mongoose.Schema({
  username: { type: String, required: true },
  content: { type: String, required: true },
  playerTag: { type: String, default: "General" },
  likes: { type: Number, default: 0 },
  timestamp: { type: Date, default: Date.now }
});

const TicketSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  matchId: { type: String, required: true },
  seatNumbers: [{ type: String }],
  stand: { type: String, required: true },
  totalPrice: { type: Number, required: true },
  bookingDate: { type: Date, default: Date.now }
});

const OrderSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  items: [
    {
      name: String,
      price: Number,
      quantity: Number,
      image: String
    }
  ],
  totalPrice: { type: Number, required: true },
  orderDate: { type: Date, default: Date.now }
});

const MongooseUser = mongoose.model("User", UserSchema);
const MongooseCheer = mongoose.model("Cheer", CheerSchema);
const MongooseTicket = mongoose.model("Ticket", TicketSchema);
const MongooseOrder = mongoose.model("Order", OrderSchema);

// Helper to create proxies that bind methods to the correct active model
const makeModelProxy = (mockModel, mongooseModel) => {
  return new Proxy({}, {
    get: (target, prop) => {
      const activeModel = isMockMode ? mockModel : mongooseModel;
      const value = activeModel[prop];
      if (typeof value === "function") {
        return value.bind(activeModel);
      }
      return value;
    }
  });
};

export const User = makeModelProxy(UserMock, MongooseUser);
export const Cheer = makeModelProxy(CheerMock, MongooseCheer);
export const Ticket = makeModelProxy(TicketMock, MongooseTicket);
export const Order = makeModelProxy(OrderMock, MongooseOrder);

export function enableMockMode() {
  isMockMode = true;
  console.log("⚠️ Database running in In-Memory Fallback Mode");
}
