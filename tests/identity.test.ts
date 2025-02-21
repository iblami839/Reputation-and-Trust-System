import { describe, it, beforeEach, expect } from "vitest"

describe("Identity Contract", () => {
  let mockStorage: Map<string, any>
  
  beforeEach(() => {
    mockStorage = new Map()
  })
  
  const mockContractCall = (method: string, args: any[], sender: string) => {
    switch (method) {
      case "register-identity":
        const [username, email] = args
        if (mockStorage.has(`identity-${sender}`)) {
          return { success: false, error: "ERR_ALREADY_EXISTS" }
        }
        mockStorage.set(`identity-${sender}`, {
          username,
          email,
          "created-at": Date.now(),
        })
        return { success: true }
      
      case "update-identity":
        const [updateUsername, updateEmail] = args
        if (!mockStorage.has(`identity-${sender}`)) {
          return { success: false, error: "ERR_NOT_FOUND" }
        }
        const existingIdentity = mockStorage.get(`identity-${sender}`)
        mockStorage.set(`identity-${sender}`, {
          ...existingIdentity,
          username: updateUsername,
          email: updateEmail,
        })
        return { success: true }
      
      case "get-identity":
        const [id] = args
        return { success: true, value: mockStorage.get(`identity-${id}`) }
      
      default:
        return { success: false, error: "Unknown method" }
    }
  }
  
  it("should register an identity", () => {
    const result = mockContractCall("register-identity", ["alice", "alice@example.com"], "user1")
    expect(result.success).toBe(true)
  })
  
  it("should not register an identity twice", () => {
    mockContractCall("register-identity", ["alice", "alice@example.com"], "user1")
    const result = mockContractCall("register-identity", ["alice2", "alice2@example.com"], "user1")
    expect(result.success).toBe(false)
    expect(result.error).toBe("ERR_ALREADY_EXISTS")
  })
  
  it("should update an identity", () => {
    mockContractCall("register-identity", ["alice", "alice@example.com"], "user1")
    const result = mockContractCall("update-identity", ["alice_updated", "alice_updated@example.com"], "user1")
    expect(result.success).toBe(true)
  })
  
  it("should not update a non-existent identity", () => {
    const result = mockContractCall("update-identity", ["bob", "bob@example.com"], "user2")
    expect(result.success).toBe(false)
    expect(result.error).toBe("ERR_NOT_FOUND")
  })
  
  it("should get an identity", () => {
    mockContractCall("register-identity", ["alice", "alice@example.com"], "user1")
    const result = mockContractCall("get-identity", ["user1"], "anyone")
    expect(result.success).toBe(true)
    expect(result.value).toMatchObject({
      username: "alice",
      email: "alice@example.com",
    })
  })
})

