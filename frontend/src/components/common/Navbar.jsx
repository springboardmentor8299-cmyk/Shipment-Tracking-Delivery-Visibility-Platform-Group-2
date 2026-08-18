import { Search, Bell, UserCircle } from "lucide-react";

function Navbar() {

  const username = localStorage.getItem("username");
  const email = localStorage.getItem("email");

  return (
    <div
      style={{
        height:"70px",
        background:"#131212",
        display:"flex",
        alignItems:"center",
        justifyContent:"space-between",
        padding:"0 30px",
        boxShadow:"0 2px 10px rgba(38, 36, 36, 0.08)"
      }}
    >

      {/* Search */}

      <div
        style={{
          display:"flex",
          alignItems:"center",
          background:"#07090a",
          padding:"10px 15px",
          borderRadius:"20px",
          width:"350px"
        }}
      >

        <Search size={20}/>

        <input
          placeholder="Search shipment..."
          style={{
            border:"none",
            outline:"none",
            background:"transparent",
            marginLeft:"10px",
            width:"100%"
          }}
        />

      </div>



      {/* Right side */}

      <div
        style={{
          display:"flex",
          alignItems:"center",
          gap:"25px"
        }}
      >

        <Bell size={25}/>


        <div
          style={{
            display:"flex",
            alignItems:"center",
            gap:"10px"
          }}
        >

          <UserCircle size={38}/>

          <div>

            <b>{username}</b>

            <br/>

            <medium>{email}</medium>

          </div>

        </div>


      </div>


    </div>
  );
}


export default Navbar;