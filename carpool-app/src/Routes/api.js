// Backend API client

const API_BASE = 'http://127.0.0.1:8000'  // FastAPI backend URL

/**
 * Sign up a new user with profile picture and address details
 * @param {Object} formData - Form data including profile picture
 * @returns {Promise<{id: number}>} Created user ID
 */
export async function signUp(data) {
    // Convert the plain object to FormData for file upload
    const formData = new FormData()
    
    // Append all scalar fields
    formData.append('firstName', data.firstName)
    formData.append('lastName', data.lastName)
    formData.append('email', data.email)
    if (data.phone) formData.append('phone', data.phone)
    
    // Company address fields
    if (data.companyAddress?.officeName) formData.append('officeName', data.companyAddress.officeName)
    if (data.companyAddress?.street) formData.append('companyStreet', data.companyAddress.street)
    if (data.companyAddress?.city) formData.append('companyCity', data.companyAddress.city)
    if (data.companyAddress?.zipcode) formData.append('companyZip', data.companyAddress.zipcode)
    
    // Home address fields
    if (data.homeAddress?.street) formData.append('homeStreet', data.homeAddress.street)
    if (data.homeAddress?.city) formData.append('homeCity', data.homeAddress.city)
    if (data.homeAddress?.zipcode) formData.append('homeZip', data.homeAddress.zipcode)
    
    // Role and preferences
    formData.append('role', data.role)
    if (data.willingToTake?.length) {
        // Append each number as a separate field - FastAPI will collect them
        data.willingToTake.forEach(num => formData.append('willingToTake', num))
    }
    if (data.hasDriversLicense !== null) {
        formData.append('hasDriversLicense', data.hasDriversLicense)
    }
    
    // Append the file last (if present)
    if (data.profile) {
        formData.append('profile', data.profile)
    }

    const response = await fetch(`${API_BASE}/signup`, {
        method: 'POST',
        body: formData,
        // Don't set Content-Type - browser will set it with boundary for FormData
        credentials: 'include'  // if you need cookies
    })

    if (!response.ok) {
        // Try to parse JSON error body
        const error = await response.json().catch(() => null)
        // If backend indicates conflict / duplicate user, throw a clear message
        if (response.status === 409 || (error && /exist/i.test(error?.detail || error?.message || ''))) {
            throw new Error('Account already exists')
        }
        throw new Error(error?.detail || error?.message || 'Signup failed')
    }

    return response.json()
}

// Add other API functions here (login, search, etc)