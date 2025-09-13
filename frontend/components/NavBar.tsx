import Image from 'next/image';
import Link from 'next/link';

const NavBar = () => {
  return (
    <nav className='flex px-8 py-6 items-center'>
      <Link href={"/"} className="flex-shrink-0">
        <div className="w-[103px] h-[18.33px] relative">
          <Image src={"/logo.png"} alt="logo" fill={true} className="object-cover" />
        </div>
      </Link>
    </nav>
  );
}

export default NavBar