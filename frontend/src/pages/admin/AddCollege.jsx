import axios from "axios";
import AdminNavBar from "../../components/navbars/AdminNavBar";
import { BASE_URL } from "../../utils/constants";
import { useState } from "react";

const AddCollege = () => {
    const [name, setName] = useState("");
    const [location, setLocation] = useState("");
    
    const handleAddCollege = async () => {
        if (!name.trim() || !location.trim()) {
    alert("College name and location are required");
    return;
  }

        try {
            await axios.post(
                `${BASE_URL}/api/college/add-college`,
                {name, location},
                { withCredentials: true }
            )
            alert("College added successfully");
            setName("");
            setLocation("");
        } catch (err) {
            console.error(err);
        }
    }
    return (
        <div className="">
            <AdminNavBar />
            <h1 className="text-center p-2 font-bold text-3xl">Add College</h1>
            <p className="text-center">Add a college to InternStatus</p>
             <div>
                <label className="font-bold">College Name</label>
                <input 
                type="text" 
                value={name}
                placeholder="College Name" 
                onChange={(e)=> setName(e.target.value)}
                />
                <label className="font-bold">Location</label>
                <input 
                type="text"
                value={location} 
                placeholder="Location" 
                onChange={(e)=> setLocation(e.target.value)}
                />
                <button 
                    onClick={handleAddCollege}
                    className="px-3 py-1 border rounded-md text-sm cursor-pointer bg-blue-500 text-white"
                >Add College</button>
             </div>
        </div>
    )
}

export default AddCollege;