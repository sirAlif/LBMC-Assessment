import React, { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchTokenListRequest } from "../redux/actions/tokenAction";
import TokenListLogo from "../assets/img/Tokenbar-Logo.png";
import TokenTable from "./TokenTable";
import TopTokenList from "./common/TopTokenList";
import "./style.css";
import { createTheme, useMediaQuery, Modal, Box } from "@mui/material";

const modalStyle = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  border: '2px solid #000',
  boxShadow: 24,
  p: 4,
};

const TokenList = () => {
  const theme = createTheme({
    breakpoints: {
      values: {
        xs: 0,
        sm: 600,
        md: 960,
        lg: 1160,
        xl: 1560,
      },
    },
  });

  const isLargeScreen = useMediaQuery(theme.breakpoints.up("lg"));
  const MediumScreen = useMediaQuery(theme.breakpoints.down("lg"));

  const [isMediumScreen, setIsMediumScreen] = useState(MediumScreen);

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(fetchTokenListRequest());
  }, [fetchTokenListRequest]);

  const tokenList = useSelector((state) => state.tokenReducer.tokenList);
  const loading = useSelector((state) => state.tokenReducer.loading);
  const error = useSelector((state) => state.tokenReducer.error);

  const [filteredTokenList, setFilteredTokenList] = useState([...tokenList]);

  const sortedTokenList = tokenList.sort(
      (a, b) =>
          (b.volume24HrsETH * 1) / (b.tradeVolumeETH * 1) -
          (a.volume24HrsETH * 1) / (a.tradeVolumeETH * 1)
  );

  const limitedTokenList = sortedTokenList.slice(0, 10).map((item, index) => {
    return {
      num: "#" + (index + 1),
      id: item.id,
      name: item.name,
      symbol: item.symbol,
      logo: item.logo,
      riserate: (
          ((item.volume24HrsETH * 1) / (item.tradeVolumeETH * 1)) *
          100
      ).toFixed(2),
    };
  });

  const [isEditing, setIsEditing] = useState(false);
  const [text, setText] = useState("Select Token/Contract Address ⌄");

  const [contractAddress, setContractAddress] = useState("");
  const [apiResponse, setApiResponse] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  useEffect(() => {
    setFilteredTokenList([...tokenList]);
  }, [tokenList, isEditing]);

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleInputChange = (e) => {
    setFilteredTokenList(
        [...tokenList].filter((obj) => {
          return (
              obj.symbol.toLowerCase().includes(e.target.value.toLowerCase()) ||
              obj.id.toLowerCase().includes(e.target.value.toLowerCase())
          );
        })
    );
  };

  const divRef = useRef(null);

  const handleClickOutside = (event) => {
    if (divRef.current && !divRef.current.contains(event.target)) {
      handleSaveClick();
    }
  };

  const handleSaveClick = () => {
    setIsEditing(false);
    setFilteredTokenList([...tokenList]);
    setText("Select Token/Contract Address ⌄");
  };

  useEffect(() => {
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Function to fetch smart contract data
  const fetchContractData = async (contract) => {
    try {
      const response = await fetch(`http://localhost:2001/api/AliFarhadiapitest/${contract}`);
      const data = await response.json();
      if (data.error) {
        setApiResponse({ type: "error", message: data.error });
      } else {
        setApiResponse({ type: "success", message: JSON.stringify(data.result[0], null, 2) });
      }
      setOpenModal(true);
    } catch (err) {
      setApiResponse({ type: "error", message: "Failed to fetch data" });
      setOpenModal(true);
    }
  };

  const handleContractAddressChange = (e) => {
    setContractAddress(e.target.value);
  };

  const handleFetchContractData = () => {
    if (contractAddress) {
      fetchContractData(contractAddress);
    }
  };

  return (
      <div className="tokenlist-background font-header">
        <img src={TokenListLogo} alt="Token List Logo" className="token-list-logo"/>
        <TopTokenList tokenList={limitedTokenList}/>
        <div className="dropdown-container font-header" style={{position: "relative"}}>
          {isEditing ? (
              <input
                  type="text"
                  placeholder={text}
                  className="dropdown-button"
                  onChange={handleInputChange}
                  style={{fontFamily: "altivo"}}
                  autoFocus
              />
          ) : (
              <button
                  onClick={handleEditClick}
                  className="dropdown-button"
                  style={{overflow: "hidden", fontFamily: "altivo"}}
              >
                {text}
              </button>
          )}
          {isEditing && (
              <div
                  ref={divRef}
                  style={{
                    position: "absolute",
                    top: "calc(45px)",
                    transform: "translateX(-50%)",
                    width: isLargeScreen ? "60vw" : "100vw",
                    backgroundColor: "#191919",
                    padding: "10px",
                    borderRadius: "5px",
                    zIndex: "50",
                    color: "white",
                    border: "2px solid transparent",
                    left: isLargeScreen ? "-13vw" : "-37vw",
                  }}
              >
                <TokenTable tokenData={filteredTokenList}/>
              </div>
          )}
        </div>

        {/* Contract Address Input */}
        <div className="contract-address-container">
          <input
              type="text"
              placeholder="Enter Smart Contract Address"
              className="contract-input dropdown-button"
              value={contractAddress}
              onChange={handleContractAddressChange}
          />
          <button onClick={handleFetchContractData} className="dropdown-button">
            Fetch Contract Data
          </button>
        </div>

        {/* Modal for displaying API response */}
        <Modal
            open={openModal}
            onClose={() => setOpenModal(false)}
            aria-labelledby="modal-title"
            aria-describedby="modal-description"
        >
          <Box sx={modalStyle}>
            <h2 id="modal-title">{apiResponse?.type === "error" ? "Error" : "Contract Data"}</h2>
            <pre id="modal-description">{apiResponse?.message}</pre>
          </Box>
        </Modal>
      </div>
  );
};

export {TokenList};
