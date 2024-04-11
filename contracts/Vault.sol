//SPDX-License-Identifier: MIT
pragma solidity 0.8.19;
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "./interface/IVault.sol";
import "./interface/ISellOrder.sol";
import "./utils/ReentrancyGuard.sol";

contract Vault is ERC20, IVault , ISellOrder ,ReentrancyGuard{
    bytes4 internal constant ERC721_INTERFACE_ID = 0x80ac58cd;

    NFTInfo public NFT;
    address internal Factory;
    bool internal initializer;
     
    mapping(uint256 => SellOrder) public sellOrders;
    uint256 public sellOrderCount;
 

    constructor(
        string memory name_,
        string memory symbol_
    ) ERC20(name_, symbol_) {}

    function initialize(
        address nft_,
        uint256 nftId_,
        address provider_,
        address recipient_,
        uint256 fragment_
    ) external override nonReentrant {
        require(!initializer, "initialize :: Already initialized");
        initializer = !initializer;

        IERC721(nft_).transferFrom(provider_, address(this), nftId_);
        require(
            IERC721(nft_).ownerOf(nftId_) == address(this),
            "nft transaction failed"
        );
        NFT = NFTInfo(nft_, nftId_);
        _mint(recipient_, fragment_);
        emit VaultCreated(nft_, nftId_, recipient_, fragment_);
    }

    // ------------------------------    market     --------------------------------------------

    function placeSellOrder(uint256 amount_, uint256 price_,address paymentToken_) override nonReentrant external {
        require(amount_ > 0, "Amount must be greater than 0");
        require(balanceOf(msg.sender) >= amount_, "Insufficient balance");
        require(price_ > 0, "Price must be greater than 0");
        
        _transfer(msg.sender, address(this), amount_);
        sellOrders[sellOrderCount] = SellOrder(
            sellOrderCount,
            amount_,
            price_,
            msg.sender,
            paymentToken_
        );
        sellOrderCount++;

        emit SellOrderPlaced(sellOrderCount - 1, amount_, price_, msg.sender);
    }

    function cancelSellOrder(uint256 orderId_) override nonReentrant external {
        SellOrder storage order = sellOrders[orderId_];
        require(order.seller == msg.sender, "Not authorized to cancel");

        _transfer(address(this),msg.sender,order.amount);
        delete sellOrders[orderId_];
        emit SellOrderCancelled(orderId_, msg.sender);
    }

    function executeBuyOrder(uint256 orderId_) override nonReentrant external {
        SellOrder storage _order = sellOrders[orderId_]; 
        require(_order.price != 0,"No such order");
        require(
            IERC20(_order.paymentToken).balanceOf(msg.sender) >= _order.price,
            "Insufficient balance to buy"
        );

        _transfer(address(this), msg.sender, _order.amount);
        IERC20(_order.paymentToken).transferFrom(msg.sender, _order.seller, _order.price);
    
        emit BuyOrderExecuted(orderId_, _order.amount, _order.price, msg.sender);

        delete sellOrders[orderId_];
    }

    // ------------------------------      NFT      --------------------------------------------
    function redeem() external override nonReentrant {
        require(
            balanceOf(msg.sender) == totalSupply(),
            "Fragmentation deficit"
        );
        IERC721 _nftContract = IERC721(NFT.nftAddress);
        address _nftOwner = _nftContract.ownerOf(NFT.nftId);
        require(
            _nftOwner == address(this),
            "The NFT is not stored in the vault"
        );
        _burn(msg.sender, totalSupply());
        _nftContract.transferFrom(address(this), msg.sender, NFT.nftId);
    }

    function onERC721Received(
        address,
        address,
        uint256,
        bytes memory
    ) public virtual override returns (bytes4) {
        return this.onERC721Received.selector;
    }

    // -----------------------  Help function   --------------------------
        /**
     * @dev This method is the interview simplification test
     */
    function getSellOrders() public override view returns (SellOrder[] memory) {
        SellOrder[] memory validOrders = new SellOrder[](sellOrderCount);
        uint256 _validOrderCount = 0;
        for (uint256 i = 0; i < sellOrderCount; i++) {
            if (sellOrders[i].amount > 0) {
                validOrders[_validOrderCount] = sellOrders[i];
                _validOrderCount++;
            }
        }

        SellOrder[] memory _result = new SellOrder[](_validOrderCount);
        for (uint256 j = 0; j < _validOrderCount; j++) {
            _result[j] = validOrders[j];
        }

        return _result;
    }
}
