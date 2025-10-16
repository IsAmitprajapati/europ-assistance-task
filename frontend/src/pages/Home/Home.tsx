import { Box, Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function Home(){
    const navigate = useNavigate()
    return(
        <Box sx={{
            display : 'flex',
            justifyContent : 'center',
            alignItems : 'center',
            minHeight : '100vh'
        }}>
            <Button variant="outlined"  onClick={()=> navigate('/auth/login')}>
                Login
            </Button>
        </Box>
    )
}