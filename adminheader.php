<?php
  // session_start();

?>
       
       <nav class="navbar navbar-expand-lg navbar-light px-5" style="background-color: #f0f0f0;">
    <a class="navbar-brand ml-5" href="./index.php">
        <img src="image/logo.png" width="80" height="80" alt="Swiss Collection">
    </a>
    <ul class="navbar-nav mr-auto mt-2 mt-lg-0"></ul>
    <div class="user-cart">  
        <?php           
        if(isset($_SESSION['user_id'])){
        ?>
            <a href="" style="text-decoration:none;">
                <i class="fa fa-user mr-5" style="font-size:30px; color:#3B3131;" aria-hidden="true"></i>
            </a>
        <?php
        } else {
        ?>
            <a href="" style="text-decoration:none;">
                <i class="fa fa-sign-in mr-5" style="font-size:30px; color:#3B3131;" aria-hidden="true"></i>
            </a>
        <?php
        } ?>
    </div>  
</nav>