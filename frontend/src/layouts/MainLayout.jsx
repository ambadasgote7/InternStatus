
const MainLayout = () => {
    return (
        <div className="flex flex-col h-screen">
            <div className="flex-1 bg-base-200 p-4">
                <div className="container mx-auto">
                    <div className="card bg-base-100 shadow-xl">
                        <div className="card-body">
                            <h2 className="card-title">InternStatus</h2>
                            <p className="card-text">
                                A platform for students to manage their internship status.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
            {/* Footer */}
            {<div className="flex-none bg-neutral text-neutral-content">
                Footer
            </div>}
        </div>
    )
}

export default MainLayout;