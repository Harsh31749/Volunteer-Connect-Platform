import React, { useState } from 'react';
import axios from 'axios';

const CreateEvent = ({ onEventCreated, onBack }) => {
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        location: '',
        date: '',
        capacity: 10,
        category: 'Community'
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

    const categories = ['Environment', 'Education', 'Health', 'Community', 'Other'];

    const { title, description, location, date, capacity, category } = formData;

    const onChange = e => 
        setFormData({ ...formData, [e.target.name]: e.target.value });

    const onSubmit = async e => {
        e.preventDefault();
        setError(null);
        setSuccess(false);

        // **Backend logic remains untouched (as per requirements)**
        try {
            await axios.post('/api/events', formData); 
            
            setSuccess(true);
            onEventCreated(); 

            // Clear form after success
            setFormData({
                title: '', description: '', location: '', date: '', 
                capacity: 10, category: 'Community'
            });

        } catch (err) {
            setError(err.response?.data?.msg || 'Failed to create event. Check required fields.');
        }
    };

    const inputStyle = 
      "w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 " +
      "placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 " +
      "focus:border-indigo-500 transition duration-150 ease-in-out shadow-sm bg-white";
      
    const labelStyle = "block mb-2 text-sm font-medium text-gray-700";

return (
        <div className="container mx-auto px-4 py-8 max-w-4xl">
            
            {/* Back Button */}
            <button 
                onClick={onBack} 
                className="flex items-center mb-6 text-indigo-600 hover:text-indigo-800 transition duration-150 font-medium bg-transparent border-none p-0 cursor-pointer"
            >
                {/* Size reduced from w-5 h-5 to w-4 h-4 */}
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                Back to Dashboard
            </button>
            
            {/* Header */}
            <h1 className="text-3xl font-extrabold text-gray-900 mb-1">
                List New Opportunity
            </h1>
            <p className="text-lg text-gray-500 mb-6">
                Digitize your event listing for volunteers.
            </p>

            {/* Form Container (Modernized Card) */}
            <form 
                onSubmit={onSubmit} 
                className="bg-white p-6 md:p-8 lg:p-10 shadow-2xl rounded-xl space-y-6"
            >
                
                {/* Title */}
                <div>
                    <label htmlFor="title" className={labelStyle}>Opportunity Title</label>
                    <input 
                        id="title"
                        type="text" 
                        placeholder="e.g., Coastal Cleanup Drive" 
                        name="title" 
                        value={title} 
                        onChange={onChange} 
                        required 
                        className={inputStyle} 
                    />
                </div>
                
                {/* Description */}
                <div>
                    <label htmlFor="description" className={labelStyle}>Description</label>
                    <textarea 
                        id="description"
                        placeholder="Detailed description of the event and tasks..." 
                        name="description" 
                        value={description} 
                        onChange={onChange} 
                        required 
                        rows="4"
                        className={inputStyle + " resize-y min-h-[100px]"}
                    ></textarea>
                </div>

                {/* Grid Layout for Location, Date, Capacity - Responsive: 1 column on mobile, 3 columns on medium screens and up */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Location */}
                    <div>
                        <label htmlFor="location" className={labelStyle}>Location</label>
                        <input 
                            id="location"
                            type="text" 
                            placeholder="City or Specific Place" 
                            name="location" 
                            value={location} 
                            onChange={onChange} 
                            required 
                            className={inputStyle} 
                        />
                    </div>
                    
                    {/* Date & Time */}
                    <div>
                        <label htmlFor="date" className={labelStyle}>Date & Time</label>
                        <input 
                            id="date"
                            type="datetime-local" 
                            name="date" 
                            value={date} 
                            onChange={onChange} 
                            required 
                            className={inputStyle} 
                        />
                    </div>

                    {/* Capacity */}
                    <div>
                        <label htmlFor="capacity" className={labelStyle}>Slots Needed</label>
                        <input 
                            id="capacity"
                            type="number" 
                            name="capacity" 
                            value={capacity} 
                            onChange={onChange} 
                            min="1" 
                            required 
                            className={inputStyle} 
                        />
                    </div>
                </div>

                {/* Category */}
                <div className="max-w-xs">
                    <label htmlFor="category" className={labelStyle}>Category</label>
                    <select 
                        id="category"
                        name="category" 
                        value={category} 
                        onChange={onChange} 
                        className={inputStyle + " appearance-none"} // Use appearance-none to rely on OS-native dropdown arrow or use custom SVG
                    >
                        {categories.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </select>
                </div>
                
                {/* Success Message Display */}
                {success && (
                    <div className="rounded-lg bg-green-50 p-4 border border-green-200">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path></svg>
                            <span className="text-sm font-medium text-green-800">
                                Event successfully created!
                            </span>
                        </div>
                    </div>
                )}

                {/* Error Message Display */}
                {error && (
                    <div className="rounded-lg bg-red-50 p-4 border border-red-200">
                        <div className="flex items-center">
                            <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path></svg>
                            <span className="text-sm font-medium text-red-800">
                                Error: {error}
                            </span>
                        </div>
                    </div>
                )}

                {/* Submit Button */}
                <button 
                    type="submit" 
                    className="w-full flex justify-center py-3 px-4 border border-transparent 
                               rounded-lg shadow-lg text-base font-semibold text-white bg-indigo-600 
                               hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 
                               focus:ring-indigo-500 transition duration-150 ease-in-out"
                >
                    List Event
                </button>
            </form>
        </div>
    );
};

export default CreateEvent;