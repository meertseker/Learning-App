type Props = {
    children: React.ReactNode;
};

const MainLayout = ({
    children,
}: Props) => {
    return (
        <div className="h-full"> {/* Add this wrapper */}
            <main className="pl-[256px] h-full">
                <div className="bg-red-500 h-full"> {/* Fixed typo here */}
                    {children}
                </div>
            </main>
        </div>
    );
};

export default MainLayout;