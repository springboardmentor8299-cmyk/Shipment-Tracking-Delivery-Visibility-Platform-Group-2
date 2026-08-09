import { useEffect, useState } from "react";
import axios from "axios";
import Navbar from "../../components/Navbar";

function Profile() {

  const [user, setUser] = useState({
    fullName: "",
    email: "",
    phone: "",
    role: ""
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {

    const email = localStorage.getItem("email");
    const token = localStorage.getItem("token");

    try {

      const response = await axios.get(
        `http://localhost:8080/api/users/${email}`,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      setUser(response.data);

    } catch (error) {

      console.error(error);

      if (error.response) {
        alert("Unable to load profile.");
      } else {
        alert("Unable to connect to server.");
      }

    }

  };

  return (
    <>
      <Navbar />

      <div className="container mt-5">

        <div className="card shadow">

          <div className="card-header bg-primary text-white">
            <h3>My Profile</h3>
          </div>

          <div className="card-body">

            <table className="table table-bordered">

              <tbody>

                <tr>
                  <th>Name</th>
                  <td>{user.fullName}</td>
                </tr>

                <tr>
                  <th>Email</th>
                  <td>{user.email}</td>
                </tr>

                <tr>
                  <th>Phone</th>
                  <td>{user.phone}</td>
                </tr>

                <tr>
                  <th>Role</th>
                  <td>{user.role}</td>
                </tr>

              </tbody>

            </table>

          </div>

        </div>

      </div>

    </>
  );
}

export default Profile;